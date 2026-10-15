import type { Command } from 'commander';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatFinding, runCheck } from '../check/engine.js';
import { loadConfig } from '../lib/config.js';
import { color, emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { detectProject } from '../lib/project.js';
import { findGlobalCss } from './init.js';

// Applies the brand to a site that already has its own styles: the site's variables are re-pointed at the brand
// tokens (so every rule using them changes at once), the brand typefaces are loaded, raw values with an exact token
// are replaced, and whatever is left is listed file by file for the agent to finish. Styling only: copy, markup and
// structure are never touched, and only the style rules run (no copy or section rules, whose fixes change content).

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Doto:wght@800&family=IBM+Plex+Mono&family=Rethink+Sans:wght@400;500&display=swap';
const COLOR_VALUE = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|oklch\(|oklab\(|lab\(|lch\(|color\(|[a-z]+$)/i;

type Mapping = { file: string; name: string; from: string; to: string; how: 'name' | 'value' };

function parseColor(value: string): [number, number, number] | undefined {
	const hex = value.match(/^#([0-9a-f]{3,8})$/i)?.[1];
	if (hex) {
		const full = hex.length <= 4 ? [...hex.slice(0, 3)].map((c) => c + c).join('') : hex.slice(0, 6);
		return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
	}
	const rgb = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
	if (rgb) return [rgb[1], rgb[2], rgb[3]].map((n) => Number(n) / 255) as [number, number, number];
	if (/^white$/i.test(value)) return [1, 1, 1];
	if (/^black$/i.test(value)) return [0, 0, 0];
	return undefined;
}

/** The brand token a site color variable stands for: by its name first, else by how light and how colorful it is. */
export function colorRole(name: string, value: string): { to: string; how: 'name' | 'value' } | undefined {
	const n = name.toLowerCase();
	const quiet = /(muted|subtle|secondary|soft|light|dim|faint|alt|2)/.test(n);
	if (/(on-?(accent|primary|brand)|(accent|primary|brand)-?(fg|text|contrast|foreground))/.test(n)) return { to: '--ds-color-text-on-brand', how: 'name' };
	if (/(accent|primary|brand|link|highlight|cta|action)/.test(n)) return { to: '--ds-color-brand', how: 'name' };
	if (/(border|line|rule|divider|stroke|outline|hairline)/.test(n)) return { to: quiet ? '--ds-color-border-subtle' : '--ds-color-border-default', how: 'name' };
	if (/(bg|background|paper|surface|canvas|page|base|card)/.test(n)) return { to: quiet ? '--ds-color-bg-subtle' : '--ds-color-bg-default', how: 'name' };
	if (/(text|ink|fg|foreground|body|copy|heading|title|content)/.test(n)) return { to: quiet ? '--ds-color-text-muted' : '--ds-color-text-default', how: 'name' };
	const rgb = parseColor(value);
	if (!rgb) return undefined;
	const max = Math.max(...rgb);
	const min = Math.min(...rgb);
	const lightness = (max + min) / 2;
	const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1));
	if (saturation > 0.35 && lightness > 0.15 && lightness < 0.85) return { to: '--ds-color-brand', how: 'value' };
	if (lightness > 0.94) return { to: '--ds-color-bg-default', how: 'value' };
	if (lightness > 0.85) return { to: '--ds-color-bg-subtle', how: 'value' };
	if (lightness < 0.15) return { to: '--ds-color-text-default', how: 'value' };
	if (lightness > 0.7) return { to: '--ds-color-border-default', how: 'value' };
	return { to: '--ds-color-text-muted', how: 'value' };
}

function fontRole(name: string, value: string) {
	if (!/(font|family|type|serif|sans|mono|face)/i.test(name) && !/(serif|sans|mono|system-ui|["'])/i.test(value)) return undefined;
	if (!/(serif|sans|mono|system-ui|["']|,)/i.test(value)) return undefined;
	return /mono|code/i.test(name + value) ? '--ds-font-mono' : '--ds-font-sans';
}

/** Stylesheets that define the site's own variables in :root. */
function siteStylesheets(root: string) {
	const bin = loadConfig().bin;
	const found = new Set<string>();
	const main = findGlobalCss(root);
	if (main) found.add(main);
	const visit = (dir: string, depth: number) => {
		if (depth > 5 || !existsSync(join(root, dir))) return;
		for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
			const rel = `${dir}/${entry.name}`;
			if (entry.isDirectory() && !['node_modules', 'dist', 'build', '.next', '.astro', bin].includes(entry.name)) visit(rel, depth + 1);
			else if (/\.(css|scss)$/.test(entry.name) && /:root\s*\{/.test(readFileSync(join(root, rel), 'utf8'))) found.add(rel);
		}
	};
	for (const dir of ['src', 'styles', 'public', 'app', 'assets']) visit(dir, 0);
	return [...found];
}

/** Re-points every site variable in a stylesheet's :root blocks at the brand token it stands for. */
export function remapVariables(css: string, file: string) {
	const mappings: Mapping[] = [];
	const skipped: string[] = [];
	const next = css.replace(/:root\s*\{[^}]*\}/g, (block) =>
		block.replace(/(--[\w-]+)(\s*:\s*)([^;}]+)/g, (decl, name: string, sep: string, raw: string) => {
			const value = raw.trim();
			if (name.startsWith('--ds-') || value.startsWith('var(--ds-')) return decl;
			const font = fontRole(name, value);
			if (font) {
				mappings.push({ file, name, from: value, to: font, how: 'name' });
				return `${name}${sep}var(${font})`;
			}
			const role = COLOR_VALUE.test(value) && !/^(inherit|initial|unset|currentcolor|transparent|none|auto)$/i.test(value) ? colorRole(name, value) : undefined;
			if (!role || (role.how === 'value' && !parseColor(value))) {
				if (COLOR_VALUE.test(value) && !/^[a-z]+$/i.test(value)) skipped.push(`${file} ${name}: ${value}`);
				return decl;
			}
			mappings.push({ file, name, from: value, to: role.to, how: role.how });
			return `${name}${sep}var(${role.to})`;
		}),
	);
	return { css: next, mappings, skipped };
}

/** Body and html font stacks that are not tokens yet become the brand typeface. */
function brandFontFamilies(css: string) {
	let changed = 0;
	const next = css.replace(/((?:^|[},;\s])(?:html|body|:root)[^{]*\{[^}]*?font-family\s*:\s*)([^;}]+)/g, (all, head: string, value: string) => {
		if (value.includes('var(')) return all;
		changed++;
		return `${head}var(${/mono/i.test(value) ? '--ds-font-mono' : '--ds-font-sans'})`;
	});
	return { css: next, changed };
}

function loadFonts(css: string) {
	if (css.includes('fonts.googleapis.com/css2?family=Doto')) return css;
	const line = `@import url("${FONTS_URL}");`;
	const lead = css.match(/^(?:\s*(?:@charset[^;]*;|\/\*[\s\S]*?\*\/))*/)?.[0] ?? '';
	return `${lead}${lead ? '\n' : ''}${line}\n${css.slice(lead.length).replace(/^\n/, '')}`;
}

export function registerApply(program: Command) {
	program
		.command('apply')
		.description("Apply the brand to the site's existing styles: re-point its variables at the brand tokens, load the typefaces, fix exact matches, then list what is left to change by hand")
		.option('--dry-run', 'show what would change, write nothing')
		.option('--list [paths...]', 'only list the style values still off-brand (all files, or these), with the token for each')
		.option('--json', 'JSON output')
		.action((opts) => {
			const root = findProjectRoot();
			const cli = loadConfig().cli;
			const project = detectProject(root);
			if (!existsSync(join(root, '.ds', 'config.json'))) throw new Error(`Run \`${cli} init\` first.`);
			if (opts.list) {
				const paths = Array.isArray(opts.list) ? opts.list.map((p: string) => join(process.cwd(), p)) : undefined;
				const result = runCheck({ projectRoot: root, paths, useBaseline: false, styleOnly: true });
				emit(opts, result, () => (result.errors ? [...result.findings.filter((f) => f.severity === 'error').map(formatFinding), '', `${result.errors} style values to change. Change the value only; keep the content and structure.`].join('\n') : 'Every style uses the brand tokens.'));
				process.exitCode = result.errors ? 1 : 0;
				return;
			}
			const sheets = siteStylesheets(root);
			const main = findGlobalCss(root);
			const mappings: Mapping[] = [];
			const skipped: string[] = [];
			const written: string[] = [];
			let fontFamilies = 0;
			for (const rel of sheets) {
				const before = readFileSync(join(root, rel), 'utf8');
				const remapped = remapVariables(before, rel);
				mappings.push(...remapped.mappings);
				skipped.push(...remapped.skipped);
				const families = brandFontFamilies(remapped.css);
				fontFamilies += families.changed;
				// Next apps load the typefaces through next/font (init wrote lib/ds-fonts.ts); everything else gets the stylesheet.
				const after = rel === main && project.framework !== 'next' ? loadFonts(families.css) : families.css;
				if (after !== before) {
					written.push(rel);
					if (!opts.dryRun) writeFileSync(join(root, rel), after);
				}
			}
			const fixed = opts.dryRun ? { fixed: 0 } : runCheck({ projectRoot: root, useBaseline: false, fix: true, styleOnly: true });
			const left = runCheck({ projectRoot: root, useBaseline: false, styleOnly: true });
			const byFile = new Map<string, number>();
			for (const f of left.findings) if (f.severity === 'error') byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
			const files = [...byFile].sort((a, b) => b[1] - a[1]);
			emit(opts, { stylesheets: sheets, written, mappings, skipped, fontFamilies, fixed: fixed.fixed, remaining: Object.fromEntries(files) }, () =>
				[
					opts.dryRun ? 'Dry run, nothing written.' : 'Applied the brand to the site styles.',
					'',
					color.bold(`1. Site variables re-pointed at brand tokens (${mappings.length}):`),
					...(mappings.length ? mappings.map((m) => `   ${m.file}  ${m.name}: ${m.from} -> var(${m.to})${m.how === 'value' ? '  (by value; check it)' : ''}`) : ['   none found (no :root variables in the site stylesheets)']),
					...skipped.map((s) => `   left as is: ${s}`),
					'',
					color.bold('2. Typefaces:'),
					`   ${project.framework === 'next' ? 'loaded through next/font by init' : main ? `Rethink Sans, Doto and IBM Plex Mono loaded at the top of ${main}` : 'no main stylesheet found; load them from Google Fonts in the base layout'}; ${fontFamilies} body/html font stacks now use var(--ds-font-sans).`,
					'',
					color.bold(`3. Raw values replaced with exact tokens: ${fixed.fixed}.`),
					'',
					color.bold(`4. Left for you (${files.reduce((a, [, n]) => a + n, 0)} errors in ${files.length} files):`),
					...(files.length
						? [...files.slice(0, 25).map(([f, n]) => `   ${String(n).padStart(4)}  ${f}`), files.length > 25 ? `   ... and ${files.length - 25} more` : '', `   Work through them: \`${cli} apply --list <file>\` shows each value and the token to use (\`${cli} tokens --search <term>\` to look one up). Replace the value with var(--ds-*); do not add overrides.`].filter(Boolean)
						: ['   nothing; every style uses the tokens.']),
					'',
					color.bold('Change style values only.') + ' Keep every word, heading, link, image, element, section and layout exactly as it is. Do not add templates, sections or components, and do not rewrite copy.',
					`Then: open the site and compare it with before (same content, new look), run \`${cli} apply --list\` until it is empty, and commit.`,
				].join('\n'),
			);
		});
}
