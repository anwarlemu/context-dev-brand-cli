import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { checkFigmaValues, dedupe } from '../figma/check.js';
import { figmaSvg, illustrationScripts, parseFigmaUrl, svgScript } from '../figma/push.js';
import { figmaTokens, figmaTokenScripts } from '../figma/tokens.js';
import { buildIllustration, illustrateData } from '../illustrate/build.js';
import { readPicture } from '../illustrate/decode.js';
import { encodePng } from '../illustrate/png.js';
import { countDots, toPixels, toSvg } from '../illustrate/render.js';
import { brand } from '../lib/brand.js';
import { unknownName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { loadIndexSync, loadItemSync } from '../library/registry.js';

// `figma` gives the Figma MCP tools what they need; the CLI never calls Figma itself. Every subcommand writes files
// and prints the exact tool calls, in order, that an agent makes with them.

type Flags = Record<string, string | boolean | undefined>;
export const FIGMA_ACTIONS = ['tokens', 'push', 'pull', 'check'] as const;
export const PUSH_KINDS = ['illustration', 'asset', 'slide', 'component', 'page'] as const;

export type Step = { tool: string; args?: Record<string, unknown>; note: string };

/** The session steps every Figma task starts with. */
const sessionSteps = (task: string, newFile: boolean): Step[] => [
	...(newFile ? [{ tool: 'whoami', note: 'Only if no planKey is known: read the plans and use the one plan, or ask which.' }, { tool: 'create_new_file', args: { fileName: `${brand().name} ${task}`, editorType: 'design', planKey: '<plan key>' }, note: 'Only when there is no target file yet. Load the figma-create-new-file skill first if the host lists it.' }] : []),
	{ tool: 'create_session', args: { fileKey: '<fileKey>', description: task }, note: 'Before any other file tool; pass the returned sessionId on every later call.' },
];
const useFigmaNote = 'Load the figma-use skill (skill://figma/figma-use/SKILL.md) before the first use_figma call, and figma-generate-library for variables or figma-generate-design for visible frames; pass skillNames.';

function outDir(flags: Flags) {
	const dir = resolve(typeof flags.out === 'string' ? flags.out : 'figma');
	mkdirSync(dir, { recursive: true });
	return dir;
}
const rel = (p: string) => p.replace(`${process.cwd()}/`, '');

function printSteps(json: boolean, doc: { files: string[]; steps: Step[]; [k: string]: unknown }, title: string) {
	emit({ json }, doc, () => [
		title,
		...doc.files.map((f) => `  wrote ${rel(f)}`),
		'Figma MCP steps, in order:',
		...doc.steps.map((s, i) => `  ${i + 1}. ${s.tool}${s.args ? ` ${JSON.stringify(s.args)}` : ''}\n     ${s.note}`),
	].join('\n'));
}

function tokensAction(flags: Flags) {
	const dir = outDir(flags);
	const doc = figmaTokens();
	const scripts = figmaTokenScripts(doc);
	const files = [join(dir, 'tokens.json')];
	writeFileSync(files[0]!, `${JSON.stringify(doc, null, 2)}\n`);
	scripts.forEach((s, i) => {
		const f = join(dir, `tokens-${i + 1}.js`);
		writeFileSync(f, s);
		files.push(f);
	});
	const steps: Step[] = [
		...sessionSteps('apply brand tokens as variables', !flags.file),
		...scripts.map((_, i) => ({ tool: 'use_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', code: `<contents of ${rel(files[i + 1]!)}>`, skillNames: 'figma-use,figma-generate-library' }, note: i === 0 ? `${useFigmaNote} The script finds or creates "${doc.collection}" with modes ${doc.modes.join(', ')}; on a plan with one mode per collection it makes one collection per mode.` : 'Same collection; continues the variables.' })),
		{ tool: 'get_variable_defs', args: { fileKey: '<fileKey>', nodeId: '<a node bound to the variables>' }, note: 'Optional check once something is bound; run figma check on the saved result.' },
	];
	printSteps(!!flags.json, { files, collection: doc.collection, modes: doc.modes, variables: doc.variables.length, effectStyles: doc.effects.length, skipped: doc.skipped, steps }, `${doc.variables.length} variables (${doc.modes.join(', ')}) and ${doc.effects.length} effect styles; ${doc.skipped.length} tokens have no Figma type.`);
}

/** Static HTML for html_to_figma: the page as rendered, stylesheets and images inlined, scripts removed. */
async function snapshotHtml(url: string, width: number): Promise<string> {
	const { launch } = await import('../review/capture.js');
	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width, height: 900 } });
		await page.goto(url, { waitUntil: 'networkidle' });
		return await page.evaluate(async () => {
			const toData = async (src: string) => {
				try {
					const blob = await (await fetch(src)).blob();
					return await new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.readAsDataURL(blob); });
				} catch { return src; }
			};
			let css = '';
			for (const sheet of Array.from(document.styleSheets)) {
				try { css += Array.from(sheet.cssRules).map((r) => r.cssText).join('\n'); } catch {}
			}
			const doc = document.documentElement.cloneNode(true) as HTMLElement;
			doc.querySelectorAll('script, link[rel="stylesheet"], link[rel="preload"], noscript, nextjs-portal').forEach((n) => n.remove());
			for (const img of Array.from(doc.querySelectorAll('img'))) if (img.src) img.src = await toData(img.src);
			const style = document.createElement('style');
			style.textContent = css.replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (_m, _q, p) => `url(${location.origin}${p})`);
			doc.querySelector('head')?.appendChild(style);
			return `<!doctype html>\n${doc.outerHTML}`;
		});
	} finally {
		await browser.close();
	}
}

async function pushAction(kind: string | undefined, target: string | undefined, flags: Flags) {
	if (!kind) throw new Error(`Name what to push: ${PUSH_KINDS.join(', ')}`);
	if (!(PUSH_KINDS as readonly string[]).includes(kind)) throw unknownName('push kind', kind, [...PUSH_KINDS]);
	const dir = outDir(flags);
	const files: string[] = [];
	const steps: Step[] = [...sessionSteps(`push ${kind}${target ? ` ${target}` : ''}`, !flags.file)];
	const extra: Record<string, unknown> = {};
	if (kind === 'illustration') {
		if (!target && typeof flags.image !== 'string') throw new Error(`Name a subject (${Object.keys(illustrateData().subjects).join(', ')}) or pass --image <file>`);
		const picture = typeof flags.image === 'string' ? await readPicture(resolve(flags.image)) : undefined;
		const name = target ?? basename(String(flags.image), extname(String(flags.image)));
		const settings: Record<string, unknown> = {};
		for (const k of ['palette', 'render', 'dither', 'field']) if (typeof flags[k] === 'string') settings[k] = flags[k];
		if (typeof flags.seed === 'string') settings.seed = Number(flags.seed);
		if (typeof flags.size === 'string') {
			const m = /^(\d+)x(\d+)$/i.exec(flags.size);
			if (!m) throw new Error('--size takes WIDTHxHEIGHT');
			settings.width = Number(m[1]);
			settings.height = Number(m[2]);
		}
		const built = buildIllustration({ subject: target, picture, pictureName: name, preset: flags.preset as string | undefined, settings });
		const frame = `Illustration / ${name}`;
		const svg = join(dir, `illustration-${name}.svg`);
		const png = join(dir, `illustration-${name}.png`);
		writeFileSync(svg, toSvg(built.illustration));
		writeFileSync(png, encodePng(toPixels(built.illustration, 1)));
		files.push(svg, png);
		const scripts = illustrationScripts(built.illustration, frame);
		scripts.forEach((s, i) => {
			const f = join(dir, `push-${name}-${i + 1}.js`);
			writeFileSync(f, s);
			files.push(f);
			steps.push({ tool: 'use_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', code: `<contents of ${rel(f)}>`, skillNames: 'figma-use,figma-generate-design' }, note: i === 0 ? `${useFigmaNote} Draws "${frame}" as real ellipses, paints bound to the color variables when figma tokens ran first.` : 'Continues the same frame.' });
		});
		steps.push({ tool: 'upload_assets', args: { fileKey: '<fileKey>', count: 1 }, note: `Alternative to the scripts: POST ${rel(svg)} with Content-Type image/svg+xml to the returned URL; it arrives as editable vectors (no variable binding).` });
		extra.dots = countDots(built.illustration);
		extra.frame = frame;
	} else if (kind === 'asset' || kind === 'slide') {
		if (!target) throw new Error(`Pass the file to push (SVG, PNG, JPEG, WebP, GIF or HTML)`);
		const file = resolve(target);
		if (!existsSync(file)) throw new Error(`No such file: ${target}`);
		const ext = extname(file).toLowerCase();
		const name = basename(file, ext);
		const types: Record<string, string> = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
		if (ext === '.html' || ext === '.htm') {
			const out = join(dir, `${name}.html`);
			writeFileSync(out, readFileSync(file));
			files.push(out);
			steps.push({ tool: 'html_to_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${rel(out)} (Content-Type text/html) to the returned single-use URL. The HTML must be self-contained (inline CSS, images as data URIs).` });
		} else if (types[ext]) {
			let upload = file;
			if (ext === '.svg') {
				const clean = figmaSvg(readFileSync(file, 'utf8'));
				upload = join(dir, `${name}.figma.svg`);
				writeFileSync(upload, clean);
				files.push(upload);
				const script = svgScript(clean, `${kind === 'slide' ? 'Slide' : 'Asset'} / ${name}`);
				if (script) {
					const f = join(dir, `push-${name}.js`);
					writeFileSync(f, script);
					files.push(f);
					steps.push({ tool: 'use_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', code: `<contents of ${rel(f)}>`, skillNames: 'figma-use,figma-generate-design' }, note: `${useFigmaNote} Imports the SVG as editable layers named from its ids, placed clear of existing frames.` });
				}
			}
			steps.push({ tool: 'upload_assets', args: { fileKey: '<fileKey>', count: 1 }, note: `${ext === '.svg' ? 'For an SVG too big for one script, or instead of it: ' : ''}POST ${rel(upload)} with Content-Type ${types[ext]} to the returned URL${ext === '.svg' ? ' (it arrives as editable vectors)' : ' (it arrives as an image fill in a new frame)'}.` });
		} else throw unknownName('file type', ext || target, Object.keys(types).concat('.html'));
	} else if (kind === 'component') {
		if (!target) throw new Error('Name a library component (see list --json)');
		const item = loadItemSync(target);
		if (!item) throw unknownName('component', target, loadIndexSync().map((i) => i.name));
		const examples = item.examples ?? [];
		const example = typeof flags.example === 'string' ? examples.find((e) => e.name === flags.example) : examples[0];
		if (!example) throw unknownName('example', String(flags.example ?? ''), examples.map((e) => e.name));
		const base = typeof flags.url === 'string' ? flags.url.replace(/\/$/, '') : undefined;
		const url = base ? `${base}${new URL(example.url).pathname}` : example.url;
		const html = await snapshotHtml(url, Number(flags.width ?? 1440));
		const out = join(dir, `component-${target}-${example.name}.html`);
		writeFileSync(out, html);
		files.push(out);
		extra.preview = url;
		steps.push({ tool: 'html_to_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>', cssSelector: '[data-preview-root]' }, note: `POST ${rel(out)} (text/html) to the returned URL. Plain layers; rebuild as a component with use_figma and the variables when it must be reusable.` });
	} else {
		if (!target) throw new Error('Pass a page URL or a saved HTML file');
		const html = /^https?:/.test(target) ? await snapshotHtml(target, Number(flags.width ?? 1440)) : readFileSync(resolve(target), 'utf8');
		const out = join(dir, `page-${(/^https?:/.test(target) ? new URL(target).pathname : basename(target)).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}.html`);
		writeFileSync(out, html);
		files.push(out);
		steps.push({ tool: 'html_to_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${rel(out)} (text/html) to the returned URL. For a live app to keep in sync, generate_figma_design or the Figma browser extension fits better.` });
	}
	steps.push({ tool: 'get_screenshot', args: { fileKey: '<fileKey>', nodeId: '<frameId from the last step>', sessionId: '<sessionId>' }, note: 'One screenshot to confirm the result; stop when it matches.' });
	printSteps(!!flags.json, { files, kind, target: target ?? null, ...extra, steps }, `Ready to push ${kind}${target ? ` ${target}` : ''}.`);
}

function pullAction(url: string | undefined, flags: Flags) {
	if (!url) throw new Error('Pass a Figma URL with a node-id (https://figma.com/design/<fileKey>/<name>?node-id=1-2)');
	const { fileKey, nodeId, kind } = parseFigmaUrl(url);
	if (kind !== 'design') throw new Error(`figma pull reads design files; this is a ${kind} URL`);
	if (!nodeId) throw new Error('The URL has no node-id: select the frame in Figma and copy its link');
	const dir = outDir(flags);
	const vars = join(dir, `variables-${nodeId.replace(':', '-')}.json`);
	const ctx = join(dir, `design-${nodeId.replace(':', '-')}.txt`);
	const steps: Step[] = [
		{ tool: 'create_session', args: { fileKey, description: `check node ${nodeId} against ${brand().name} tokens` }, note: 'First; pass the returned sessionId on the next calls.' },
		{ tool: 'get_variable_defs', args: { fileKey, nodeId, sessionId: '<sessionId>' }, note: `Save the JSON result to ${rel(vars)}.` },
		{ tool: 'get_design_context', args: { fileKey, nodeId, sessionId: '<sessionId>', clientFrameworks: 'react', clientLanguages: 'typescript' }, note: `Load the figma-design-to-code skill first. Save the returned code to ${rel(ctx)}.` },
		{ tool: 'shell', args: { run: `npx ${brand().bin} figma check ${rel(vars)} ${rel(ctx)} --json` }, note: 'Lists every value that is not a brand token, with the nearest token. Build with library components and tokens, never the raw values.' },
	];
	printSteps(!!flags.json, { files: [], fileKey, nodeId, saveTo: { variables: vars, designContext: ctx }, steps }, `Figma file ${fileKey}, node ${nodeId}.`);
}

function checkAction(paths: string[], flags: Flags) {
	if (!paths.length) throw new Error('Pass the saved get_variable_defs JSON and/or get_design_context code');
	const all = paths.flatMap((p) => {
		if (!existsSync(p)) throw new Error(`No such file: ${p}`);
		return checkFigmaValues(readFileSync(p, 'utf8')).map((f) => ({ ...f, where: `${p} ${f.where}` }));
	});
	const findings = dedupe(all);
	const off = findings.filter((f) => !f.ok);
	const doc = { ok: off.length === 0, checked: all.length, offBrand: off, onBrand: findings.filter((f) => f.ok) };
	emit({ json: !!flags.json }, doc, () => (off.length ? [`${off.length} off-brand value${off.length === 1 ? '' : 's'}:`, ...off.map((f) => `  ${f.kind.padEnd(7)} ${f.message} (${f.count}x, first at ${f.where})`)] : [`All ${all.length} values are brand tokens.`]).join('\n'));
	if (off.length) process.exitCode = 1;
}

export function registerFigma(program: Command) {
	program.command('figma [action] [args...]')
		.description('Work in Figma through its MCP tools: tokens (variables), push <illustration|asset|slide|component|page>, pull <url>, check <files...>')
		.option('--out <dir>', 'where to write the files (default ./figma)')
		.option('--file <key>', 'an existing Figma file key (skips the create-file steps)')
		.option('--image <file>', 'push illustration: any picture')
		.option('--preset <name>', 'push illustration: shader preset')
		.option('--palette <name>', 'push illustration: palette')
		.option('--size <WxH>', 'push illustration: frame size')
		.option('--seed <n>', 'push illustration: seed')
		.option('--example <name>', 'push component: which example (default the first)')
		.option('--url <base>', 'push component: docs site to capture from (default the hosted registry)')
		.option('--width <px>', 'push component or page: capture width', '1440')
		.option('--json', 'JSON output')
		.action(async (action: string | undefined, args: string[], _o: unknown, cmd: Command) => {
			const flags = cmd.optsWithGlobals() as Flags;
			if (!action) throw new Error(`Name an action: ${FIGMA_ACTIONS.join(', ')}`);
			if (action === 'tokens') return tokensAction(flags);
			if (action === 'push') return pushAction(args[0], args[1], flags);
			if (action === 'pull') return pullAction(args[0], flags);
			if (action === 'check') return checkAction(args, flags);
			throw unknownName('figma action', action, [...FIGMA_ACTIONS]);
		});
}
