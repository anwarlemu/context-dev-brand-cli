import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import type { Command } from 'commander';
import { buildIllustration, ENUMS, illustrateData, type Settings } from '../illustrate/build.js';
import { readPicture } from '../illustrate/decode.js';
import { encodePng } from '../illustrate/png.js';
import { countDots, toPixels, toSvg } from '../illustrate/render.js';
import { imageDoc } from '../assets/og.js';
import { sizeId } from '../assets/image.js';
import { brand } from '../lib/brand.js';
import { unknownName } from '../lib/names.js';
import { emit } from '../lib/output.js';

type Flags = Record<string, string | boolean | undefined>;

const NUMBER_FLAGS: [flag: string, key: keyof Settings, help: string][] = [
	['width', 'width', 'frame width in px'],
	['height', 'height', 'frame height in px'],
	['pad', 'pad', 'padding around the grid in px'],
	['dot', 'dot', 'dot size (diameter) in px'],
	['gap', 'gap', 'gap between dots in px'],
	['ring', 'ring', 'hollow dot stroke in px'],
	['fit', 'fit', 'subject scale, percent of the size that fits the frame'],
	['offset-x', 'offsetX', 'move the subject, share of the width (-0.6 to 0.6)'],
	['offset-y', 'offsetY', 'move the subject, share of the height'],
	['key-tol', 'keyTol', 'background removal tolerance (2 to 40)'],
	['fill', 'fill', 'percent of the subject\'s dots that are filled'],
	['hollow', 'hollow', 'percent of the subject\'s dots that are hollow'],
	['contrast', 'contrast', 'local contrast (0 to 3)'],
	['edges', 'edges', 'edge strength added to light (0 to 2)'],
	['field-opacity', 'fieldOpacity', 'field layer opacity (0 to 1)'],
	['seed', 'seed', 'breaks ties between equally lit dots; 0 is the playground\'s order'],
];

/** `illustrate`'s names, for --list, the manifest and the agent guide. */
export function illustrateNames() {
	const d = illustrateData();
	return {
		subjects: Object.fromEntries(Object.entries(d.subjects).map(([k, v]) => [k, { kind: v.kind, source: v.$source }])),
		palettes: Object.fromEntries(Object.entries(d.palettes).map(([k, v]) => [k, { bg: v.bg, fill: v.fill, ring: v.ring, field: v.field, source: v.$source }])),
		presets: Object.fromEntries(Object.entries(d.presets).map(([k, v]) => [k, v.$source])),
		enums: ENUMS,
		formats: ['svg', 'png'],
	};
}

function settingsFrom(flags: Flags): Partial<Settings> {
	const out: Partial<Settings> = {};
	for (const [flag, key] of NUMBER_FLAGS) {
		const raw = flags[flag.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())];
		if (raw === undefined) continue;
		const n = Number(raw);
		if (!Number.isFinite(n)) throw new Error(`--${flag} needs a number, got \`${raw}\``);
		(out as Record<string, number>)[key] = n;
	}
	if (typeof flags.size === 'string') {
		const m = /^(\d+)\s*[x×]\s*(\d+)$/i.exec(flags.size);
		if (m) {
			out.width = Number(m[1]);
			out.height = Number(m[2]);
		} else {
			// Or one of the shared sizes (og, story, x-banner...).
			const id = sizeId(flags.size);
			const s = id === 'custom' ? undefined : imageDoc().sizes[id];
			if (!s) throw new Error(`--size takes a size (og, square, story, x-banner...) or WIDTHxHEIGHT, such as 1200x630; got \`${flags.size}\``);
			out.width = s.w;
			out.height = s.h;
		}
	}
	if (typeof flags.theme === 'string') {
		if (typeof flags.palette === 'string' && flags.palette !== flags.theme) throw new Error('--theme and --palette are the same thing; pass one.');
		out.palette = flags.theme;
	}
	for (const key of ['render', 'dither', 'cutout', 'empty', 'field', 'palette', 'shader'] as const) if (typeof flags[key] === 'string') (out as Record<string, string>)[key] = flags[key] as string;
	if (flags.invert) out.invert = true;
	if (flags.transparent) out.transparent = true;
	return out;
}

/** Runs the command; returns the JSON document it prints. */
export async function illustrate(subject: string | undefined, flags: Flags) {
	if (flags.list) {
		const names = illustrateNames();
		emit({ json: !!flags.json }, names, () => [
			`Subjects (${brand().bin} illustrate <subject>):`,
			...Object.entries(names.subjects).map(([k, v]) => `  ${k.padEnd(12)} ${v.kind.padEnd(8)} ${v.source}`),
			'Palettes (--palette):',
			...Object.entries(names.palettes).map(([k, v]) => `  ${k.padEnd(12)} ${v.bg} ground, ${v.fill} dots, ${v.field} field`),
			'Presets (--preset):',
			...Object.entries(names.presets).map(([k, v]) => `  ${k.padEnd(12)} ${v}`),
			'Any picture: --image <file> (PNG best, with a transparent background).',
		].join('\n'));
		return names;
	}
	if (subject && flags.image) throw new Error('Pass a subject or --image, not both');
	const formats = String(flags.format ?? 'svg,png').split(',').map((f) => f.trim().toLowerCase()).filter(Boolean);
	for (const f of formats) if (f !== 'svg' && f !== 'png') throw unknownName('format', f, ['svg', 'png']);
	const scale = Number(flags.scale ?? 2);
	if (![1, 2, 3, 4].includes(scale)) throw new Error('--scale takes 1, 2, 3 or 4');
	const picture = typeof flags.image === 'string' ? await readPicture(resolve(String(flags.image))) : undefined;
	const pictureName = typeof flags.image === 'string' ? basename(String(flags.image), extname(String(flags.image))) : undefined;
	const built = buildIllustration({ subject, picture, pictureName, preset: flags.preset as string | undefined, settings: settingsFrom(flags) });
	if (!built.illustration.layers.some((l) => l.id !== 'field' && l.circles.length)) throw new Error('Nothing was drawn: the picture has no shape the dots can show (it may be empty, or all background). Try --cutout whole.');
	const name = subject ?? pictureName ?? 'picture';
	const outArg = typeof flags.out === 'string' ? resolve(flags.out) : resolve(`illustration-${name}`);
	const base = /\.(svg|png)$/i.test(outArg) ? outArg.slice(0, -4) : outArg;
	mkdirSync(dirname(base), { recursive: true });
	const files: string[] = [];
	if (formats.includes('svg')) {
		writeFileSync(`${base}.svg`, toSvg(built.illustration));
		files.push(`${base}.svg`);
	}
	if (formats.includes('png')) {
		writeFileSync(`${base}.png`, encodePng(toPixels(built.illustration, scale)));
		files.push(`${base}.png`);
	}
	const doc = {
		files,
		subject: built.subject ?? null,
		image: flags.image ?? null,
		kind: built.kind,
		source: built.source,
		cutout: built.info ?? null,
		size: { width: built.illustration.width, height: built.illustration.height, pngScale: scale },
		dots: countDots(built.illustration),
		settings: built.settings,
	};
	emit({ json: !!flags.json }, doc, () => [`Wrote ${files.map((f) => f.replace(`${process.cwd()}/`, '')).join(' and ')}`, `${built.kind} · ${Object.entries(doc.dots).map(([k, v]) => `${v} ${k}`).join(', ')} · palette ${built.settings.palette} · seed ${built.settings.seed}`].join('\n'));
	return doc;
}

export function registerIllustrate(program: Command) {
	const cmd = program.command('illustrate [subject]')
		.description('Draw a dot illustration from a built-in subject or any picture (--image); writes SVG with real circles and PNG')
		.option('--image <file>', 'any picture (PNG best; JPEG, WebP and SVG through a browser)')
		.option('--preset <name>', 'shader settings from the brand (see --list)')
		.option('--palette <name>', 'colors from brand tokens (see --list)')
		.option('--theme <name>', 'the same as --palette')
		.option('--size <size>', 'frame size: a shared size (og, square, story, x-banner...) or WxH, such as 1200x630')
		.option('--render <mode>', 'toneEdges, tone, edges or silhouette')
		.option('--dither <mode>', 'none, diffuse or pattern')
		.option('--cutout <mode>', 'auto (remove the background) or whole')
		.option('--empty <mode>', 'dots left empty inside the subject: hidden or field')
		.option('--field <style>', 'background grid: none, faint, rings or dots')
		.option('--shader <name>', 'playground (default, every setting applies) or kit (the website kit\'s fixed 80 by 60 grid)')
		.option('--invert', 'invert light')
		.option('--transparent', 'no background')
		.option('--format <list>', 'svg, png or svg,png', 'svg,png')
		.option('--scale <n>', 'PNG scale: 1, 2, 3 or 4', '2')
		.option('--out <path>', 'output path without extension (default: ./illustration-<subject>)')
		.option('--list', 'list subjects, palettes and presets')
		.option('--json', 'JSON output');
	for (const [flag, , help] of NUMBER_FLAGS) cmd.option(`--${flag} <n>`, help);
	cmd.action(async (subject: string | undefined, _opts: unknown, c: Command) => {
		await illustrate(subject, c.optsWithGlobals() as Flags);
	});
}
