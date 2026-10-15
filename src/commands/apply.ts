import type { Command } from 'commander';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { collectFiles, formatFinding, runCheck } from '../check/engine.js';
import { loadCheckConfig } from '../lib/config.js';
import { detectComponents, findRecipe, surfaceFor } from '../lib/recipes.js';
import { loadConfig } from '../lib/config.js';
import { color, emit } from '../lib/output.js';
import { findProjectRoot, pkgPath } from '../lib/paths.js';
import { detectProject } from '../lib/project.js';
import { findGlobalCss } from './init.js';
import { type RebrandStats, brandLiteral, classPalette, nativePalette, rebrandClasses, rebrandCss, rebrandMarkup, rebrandNative, rebrandScript, rebrandSvgAsset, sitePalette } from '../lib/rebrand.js';
import { walkFiles } from '../lib/glob.js';
import { type InterfaceProfile, profileInterface, savedSurface } from '../lib/surface.js';
import type { Surface } from '../lib/recipes.js';

// Applies the brand to an interface that already has its own styles, in any stack: it first reads what the interface
// is (a product people work in, or a marketing site) and keeps that, then converts every style value to the brand
// token for the role it plays, adds the product theme or the site's page frame, and lists each component with the
// recipe it should wear. Styling only: copy, markup and structure are never touched, and only the style rules run.

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Doto:wght@800&family=IBM+Plex+Mono&family=Rethink+Sans:wght@400;500&display=swap';
function loadFonts(css: string) {
	if (css.includes('fonts.googleapis.com/css2?family=Doto')) return css;
	const line = `@import url("${FONTS_URL}");`;
	const lead = css.match(/^(?:\s*(?:@charset[^;]*;|\/\*[\s\S]*?\*\/))*/)?.[0] ?? '';
	return `${lead}${lead ? '\n' : ''}${line}\n${css.slice(lead.length).replace(/^\n/, '')}`;
}

const STYLES = /\.(css|scss|sass|less|styl|pcss|postcss)$/;
// Templates of every web stack: their <style> blocks, style attributes and class lists are styling.
const MARKUP = /\.(astro|vue|svelte|html?|erb|php|hbs|handlebars|mustache|liquid|njk|jinja2?|j2|twig|ejs|cshtml|razor|heex|eex|gohtml|tmpl|jsp)$/;
const SCRIPT = /\.(tsx|jsx|ts|js|mjs|cjs)$/;
// Native and other UI code: color values in the language's own form.
const NATIVE = /\.(swift|kt|kts|java|dart|xaml|cs|py|rb|go|rs|ex|exs|lua|m|mm)$/;
const ANDROID_XML = /(^|\/)res\/(values[^/]*|layout[^/]*|drawable[^/]*|color[^/]*)\/[^/]+\.xml$/;
const THEME_DATA = /(^|\/)[^/]*(theme|colou?rs|palette|tokens)[^/]*\.(json|ya?ml|toml)$/i;
const SKIP = /(^|\/)(\.?[\w-]+\.config\.[cm]?[jt]s|package(-lock)?\.json|tsconfig[^/]*\.json|[^/]*\.(min|d)\.[jt]s|[^/]*\.(test|spec)\.[jt]sx?)$/;

/** The product theme for stacks without the brand's Tailwind theme: the dashboard's tokens, root size and page. */
function productCss(dark: 'light' | 'dark', darkSelectors: string[]) {
	const tokens = readFileSync(pkgPath('build', 'tokens.css'), 'utf8');
	const light = tokens.match(/\n\.ds-product \{([^}]*)\}/)?.[1] ?? '';
	const darkVars = tokens.match(/\n\.ds-product\[data-theme="dark"\],[^{]*\{([^}]*)\}/)?.[1] ?? '';
	const darkBlock = (sel: string) => (sel.startsWith('@media') ? `${sel} {\n\t:root {${darkVars.replace(/\n\t/g, '\n\t\t')}\t\tcolor-scheme: dark;\n\t}\n}` : `${sel} {${darkVars}\tcolor-scheme: dark;\n}`);
	return [
		'/* The product theme (the dashboard): its type scale, hairlines and shadows, a 15px root and the canvas page. */',
		`:root {${light}}`,
		...(dark === 'dark' ? [`:root {${darkVars}\tcolor-scheme: dark;\n}`] : darkSelectors.map(darkBlock)),
		'html {\n\tfont-size: 93.75%;\n\t-webkit-text-size-adjust: 100%;\n}',
		'body {\n\tbackground: var(--ds-color-bg-canvas);\n\tcolor: var(--ds-color-text-default);\n\tfont-family: var(--ds-font-sans);\n}',
		'',
	].join('\n');
}

/** How the site switches to its own dark theme, so the product's dark theme follows the same switch. */
function darkSwitches(css: string) {
	const found = new Set<string>();
	if (/\.dark\b/.test(css)) found.add('.dark');
	const attr = css.match(/\[data-(theme|mode|color-scheme|bs-theme)\s*=\s*["']?dark["']?\]/)?.[1];
	if (attr) found.add(`[data-${attr}="dark"]`);
	if (/prefers-color-scheme\s*:\s*dark/.test(css)) found.add('@media (prefers-color-scheme: dark)');
	return [...found];
}

/** Puts the product scope on <html> in the app's root layout, for the brand theme's product utilities. */
function addProductScope(root: string, dryRun: boolean) {
	for (const rel of ['src/app/layout.tsx', 'src/app/layout.jsx', 'src/app/layout.js', 'app/layout.tsx', 'app/layout.jsx', 'app/layout.js', 'index.html', 'src/layouts/Layout.astro', 'src/layouts/BaseLayout.astro']) {
		const path = join(root, rel);
		if (!existsSync(path)) continue;
		const text = readFileSync(path, 'utf8');
		if (/ds-product/.test(text)) return rel;
		const next = text.replace(/<html\b([^>]*?)\b(className|class)=(["'])([^"']*)\3/, (all, pre: string, attr: string, q: string, cls: string) => `<html${pre}${attr}=${q}${cls ? `${cls} ` : ''}ds-product${q}`).replace(/<html\b(?![^>]*\b(?:className|class)=)/, (all) => `${all} ${rel.endsWith('x') || rel.endsWith('.js') ? 'className' : 'class'}="ds-product"`);
		if (next !== text && !dryRun) writeFileSync(path, next);
		return next !== text ? rel : undefined;
	}
	return undefined;
}

/**
 * A Next app restyled in place loads the brand typefaces through next/font: the loader init wrote is imported in the
 * root layout and its variables go on <html>, next to the app's own (which stay, so nothing that names them breaks).
 */
function wireNextFonts(root: string, project: ReturnType<typeof detectProject>, dryRun: boolean) {
	const libDir = project.srcDir && existsSync(join(root, 'src', 'lib')) ? 'src/lib' : 'lib';
	const loader = ['ts', 'js'].map((ext) => `${libDir}/ds-fonts.${ext}`).find((rel) => existsSync(join(root, rel)));
	const layoutRel = ['tsx', 'jsx', 'js'].map((ext) => `${project.appDir ?? 'app'}/layout.${ext}`).find((rel) => existsSync(join(root, rel)));
	if (!loader || !layoutRel) return undefined;
	const layout = readFileSync(join(root, layoutRel), 'utf8');
	if (layout.includes('dsFontVariables')) return layoutRel;
	const from = project.hasAlias ? `@/${libDir.replace(/^src\//, '')}/ds-fonts` : relative(dirname(join(root, layoutRel)), join(root, libDir, 'ds-fonts')).replace(/^(?!\.)/, './');
	let next = layout.replace(/<html\b([^>]*?)\bclassName=(\{`([^`]*)`\}|\{([^}]+)\}|"([^"]*)")/, (all, pre: string, _v: string, tpl?: string, expr?: string, str?: string) => {
		const inner = tpl !== undefined ? tpl : expr !== undefined ? `\${${expr.trim()}}` : str;
		return `<html${pre}className={\`\${dsFontVariables} ${inner}\`}`;
	});
	if (next === layout) next = layout.replace(/<html\b/, '<html className={dsFontVariables}');
	if (next === layout) return undefined;
	const lastImport = [...next.matchAll(/^import [^;]+;?\n/gm)].pop();
	const line = `import { dsFontVariables } from '${from}';\n`;
	next = lastImport ? next.slice(0, lastImport.index! + lastImport[0].length) + line + next.slice(lastImport.index! + lastImport[0].length) : line + next;
	if (!dryRun) writeFileSync(join(root, layoutRel), next);
	return layoutRel;
}

export function registerApply(program: Command) {
	program
		.command('apply')
		.description("Apply the brand to an existing interface in any stack: read what it is (product or marketing site), convert every style value to the brand token for its role, add the product theme or the site frame, then list each component with its recipe")
		.option('--dry-run', 'show what would change, write nothing')
		.option('--list [paths...]', 'only list the style values still off-brand (all files, or these), with the token for each')
		.option('--surface <surface>', 'product (a dashboard, admin or app) or marketing (a site); default: read from the project')
		.option('--theme <theme>', 'product only: light (the default) or dark')
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
			if (opts.surface && !['product', 'marketing'].includes(opts.surface)) throw new Error('--surface is product or marketing.');
			const bin = loadConfig().bin;
			const own = new RegExp(`(^|/)(${bin}|components/ds)/`);
			const webFiles = collectFiles(root, loadCheckConfig(root)).filter((rel) => !/\.(md|mdx)$/.test(rel));
			const otherFiles = walkFiles(root, ['**/*'], ['**/node_modules/**']).filter((rel) => (STYLES.test(rel) || MARKUP.test(rel) || NATIVE.test(rel) || ANDROID_XML.test(rel) || THEME_DATA.test(rel)) && !webFiles.includes(rel));
			const files = [...webFiles, ...otherFiles].filter((rel) => !own.test(rel) && !SKIP.test(rel) && !/\.min\.css$/.test(rel));

			// 1. What the interface is, before anything changes: a product keeps its working layout and density and gets
			// the product theme; a site gets the site's frame. A project with both is read per folder.
			const profile: InterfaceProfile = profileInterface(root, files);
			const saved = savedSurface(root);
			const mixed = !opts.surface && !saved && profile.mixed;
			const surface: Surface = opts.surface ?? saved ?? profile.surface;
			if (!opts.dryRun && !mixed && (opts.surface || !saved)) {
				const configPath = join(root, '.ds', 'config.json');
				const config = JSON.parse(readFileSync(configPath, 'utf8'));
				writeFileSync(configPath, `${JSON.stringify({ ...config, surface }, null, 2)}\n`);
			}
			const theme: 'light' | 'dark' = opts.theme === 'dark' ? 'dark' : 'light';
			const literalTheme = surface === 'product' ? (theme === 'dark' ? 'product-dark' : 'product') : 'root';

			const main = findGlobalCss(root);
			// The site's own background and text decide what each of its colors means, so read them before changing anything.
			const styleText = files.filter((rel) => STYLES.test(rel) || MARKUP.test(rel)).map((rel) => readFileSync(join(root, rel), 'utf8')).join('\n');
			const cssPalette = sitePalette([...(main ? [readFileSync(join(root, main), 'utf8')] : []), styleText].join('\n'));
			const nativeFiles = files.filter((rel) => NATIVE.test(rel) || ANDROID_XML.test(rel));
			const palette = { ...(cssPalette.found || !nativeFiles.length ? cssPalette : nativePalette(nativeFiles.map((rel) => readFileSync(join(root, rel), 'utf8')))), target: (surface === 'product' && theme === 'dark' ? 'dark' : 'light') as 'light' | 'dark' };
			const switches = darkSwitches(styleText);
			// With Tailwind, the root layout's classes set the page colors for every page that does not set its own.
			const layoutFile = ['tsx', 'jsx', 'js'].map((ext) => `${project.appDir ?? 'app'}/layout.${ext}`).find((rel) => existsSync(join(root, rel)));
			const layoutPalette = layoutFile ? classPalette(readFileSync(join(root, layoutFile), 'utf8'), palette) : palette;
			const tailwind = project.tailwindMajor ? (existsSync(join(root, dirname(main ?? 'x'), bin, 'theme.css')) || /theme\.css/.test(main ? readFileSync(join(root, main), 'utf8') : '') ? 'theme' : 'arbitrary') : undefined;
			const stats: RebrandStats = { colors: 0, fonts: 0, type: 0, radius: 0, spacing: 0, motion: 0, shadows: 0 };
			const written: string[] = [];
			const kinds = { styles: 0, markup: 0, scripts: 0, native: 0 };
			for (const rel of files) {
				const before = readFileSync(join(root, rel), 'utf8');
				let after = before;
				if (STYLES.test(rel)) after = rebrandCss(before, /\.(sass|styl)$/.test(rel) ? { ...palette, lines: true } : palette, stats);
				else if (MARKUP.test(rel)) {
					after = rebrandMarkup(before, palette, stats);
					if (tailwind) after = after.replace(/(\sclass(?:Name)?\s*=\s*)(["'])([^"']*)\2/g, (all, head: string, q: string, cls: string) => `${head}${q}${rebrandClasses(cls, palette, stats, tailwind === 'theme')}${q}`);
				} else if (SCRIPT.test(rel)) after = rebrandScript(before, tailwind ? classPalette(before, layoutPalette) : palette, stats, { tailwind, hex: (t) => brandLiteral(t, literalTheme) });
				else if (NATIVE.test(rel) || ANDROID_XML.test(rel) || THEME_DATA.test(rel)) after = rebrandNative(before, palette, stats, literalTheme, rel.endsWith('.xml') || rel.endsWith('.xaml'));
				if (rel === main) {
					// Next apps load the typefaces through next/font (init wrote lib/ds-fonts.ts); everything else gets the stylesheet.
					if (project.framework !== 'next') after = loadFonts(after);
					const layer = surface === 'product' ? 'product' : 'frame';
					const importLine = `@import "./${bin}/${layer}.css";`;
					after = after.replace(new RegExp(`@import\\s+["']\\./${bin}/(frame|product)\\.css["'];\\n?`, 'g'), '');
					const tokensImport = after.match(new RegExp(`@import\\s+["']\\./${bin}/(tokens|theme)\\.css["'];`))?.[0];
					after = tokensImport ? after.replace(tokensImport, `${tokensImport}\n${importLine}`) : `${importLine}\n${after}`;
				}
				if (after !== before) {
					written.push(rel);
					kinds[STYLES.test(rel) ? 'styles' : MARKUP.test(rel) ? 'markup' : SCRIPT.test(rel) ? 'scripts' : 'native']++;
					if (!opts.dryRun) writeFileSync(join(root, rel), after);
				}
			}
			// Marks drawn for a dark site (a white logo file) would vanish on the brand's white page.
			const marks: string[] = [];
			if (literalTheme !== 'product-dark') {
				// Only marks the pages draw (img src, CSS url(), imports); a file offered as a download stays as it is.
				const drawn = files.filter((rel) => MARKUP.test(rel) || SCRIPT.test(rel) || STYLES.test(rel)).map((rel) => readFileSync(join(root, rel), 'utf8')).join('\n');
				const isDrawn = (name: string) => new RegExp(`(src(set)?\\s*=\\s*["'{][^"'}]*|url\\(\\s*["']?[^)]*|import[^;]*|:\\s*["'][^"']*)${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(drawn);
				for (const rel of walkFiles(root, ['**/*.svg'], ['node_modules/**', `**/${bin}/**`]).filter((rel) => isDrawn(rel.split('/').pop()!))) {
					const before = readFileSync(join(root, rel), 'utf8');
					const after = rebrandSvgAsset(before, palette);
					if (after !== before) {
						marks.push(rel);
						if (!opts.dryRun) writeFileSync(join(root, rel), after);
					}
				}
			}
			const layerDir = main ? join(root, dirname(main), bin) : undefined;
			if (layerDir && !opts.dryRun) {
				mkdirSync(layerDir, { recursive: true });
				if (surface === 'product') writeFileSync(join(layerDir, 'product.css'), productCss(theme, switches));
				else writeFileSync(join(layerDir, 'frame.css'), readFileSync(pkgPath('styles', 'frame.css'), 'utf8'));
			}
			const scoped = surface === 'product' && tailwind === 'theme' ? addProductScope(root, !!opts.dryRun) : undefined;
			const fontsIn = project.framework === 'next' ? wireNextFonts(root, project, !!opts.dryRun) : undefined;
			const fixed = opts.dryRun ? { fixed: 0 } : runCheck({ projectRoot: root, useBaseline: false, fix: true, styleOnly: true });
			const left = runCheck({ projectRoot: root, useBaseline: false, styleOnly: true });
			// Every element with a recipe, so each button, card, field and nav gets the brand's styling for its situation.
			const components = files.flatMap((rel) => {
				const fileSurface = mixed ? surfaceFor(root, rel) : surface;
				return SCRIPT.test(rel) || MARKUP.test(rel) || STYLES.test(rel) ? detectComponents(rel, readFileSync(join(root, rel), 'utf8'), fileSurface).map((c) => ({ file: rel, ...c })) : [];
			});
			const byRecipe = new Map<string, number>();
			for (const c of components) byRecipe.set(c.recipe, (byRecipe.get(c.recipe) ?? 0) + 1);
			// One line per recipe, each distinct selector or class once, page structure and actions before details.
			const ORDER = ['page', 'navigation', 'actions', 'containers', 'forms', 'text', 'data', 'feedback'];
			const grouped = new Map<string, { key: string; file: string; line: number }[]>();
			for (const c of components) {
				const key = c.label.startsWith('<') ? c.label.replace(/^<([\w.-]+).*?class(?:Name)?=["'{`]*([^"'`}]*).*$/s, (all, tag: string, cls: string) => `<${tag}${cls ? ` class="${cls.trim().split(/\s+/).slice(0, 2).join(' ')}"` : ''}>`).replace(/^<([\w.-]+)\s[^"]*$/, '<$1>') : c.label;
				const list = grouped.get(c.recipe) ?? [];
				if (!list.some((x) => x.key === key)) list.push({ key, file: c.file, line: c.line });
				grouped.set(c.recipe, list);
			}
			const groupOf = (id: string) => ORDER.indexOf(findRecipe(id)?.group ?? 'feedback');
			const groups = [...grouped].sort((a, b) => groupOf(a[0]) - groupOf(b[0]) || b[1].length - a[1].length);
			const byFile = new Map<string, number>();
			for (const f of left.findings) if (f.severity === 'error') byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
			const remaining = [...byFile].sort((a, b) => b[1] - a[1]);
			const nativeOnly = !main && kinds.native > 0;
			const what = mixed ? 'both a product and a marketing site (each folder gets its own recipes)' : surface === 'product' ? 'a product (an app people work in: dashboard, admin, tools)' : 'a marketing site (pages people read and act on)';
			emit(opts, { profile: { ...profile, surface, mixed }, palette: { mode: palette.mode, bg: palette.bg, fg: palette.fg }, written, kinds, marks, stats, fixed: fixed.fixed, remaining: Object.fromEntries(remaining), components }, () =>
				[
					opts.dryRun ? 'Dry run, nothing written.' : 'Applied the brand.',
					'',
					color.bold(`1. What this interface is: ${what}.`),
					`   Evidence: ${profile.reasons.slice(0, 6).join('; ') || 'none found, so it is treated as a site'}.${opts.surface || saved ? ` (Set by ${opts.surface ? '--surface' : '.ds/config.json'}.)` : ` Wrong? Run \`${cli} apply --surface ${surface === 'product' ? 'marketing' : 'product'}\`.`}`,
					...(profile.screens.length ? [`   Screens: ${profile.screens.slice(0, 12).join(', ')}${profile.screens.length > 12 ? `, +${profile.screens.length - 12} more` : ''}`] : []),
					`   Before restyling a screen, read it and say in one line what it is for: who uses it, the one main action, the information that matters most. Then keep that: the main action stays the most prominent thing, ${surface === 'product' ? 'data stays dense and scannable, navigation and filters stay where people expect them' : 'the reading order and calls to action stay as they are'}. The brand changes how it looks, never what it does.`,
					'',
					color.bold(`2. Every style value converted to the brand (${written.length} files: ${kinds.styles} stylesheets, ${kinds.markup} templates, ${kinds.scripts} scripts, ${kinds.native} native or other):`),
					`   ${stats.colors} colors mapped by role${palette.mode === 'dark' && literalTheme !== 'product-dark' ? ' (a dark interface turned into the brand\'s light one)' : ''}, ${stats.fonts} font stacks to Rethink Sans, ${stats.type} sizes, weights and tracking to the type scale,`,
					`   ${stats.radius} radii, ${stats.spacing} spacings, ${stats.shadows} shadows and ${stats.motion} transitions to the nearest brand token.${kinds.native ? ' Native and other code gets the brand\'s literal values in its own color form (no new imports).' : ''}`,
					...(marks.length ? [`   ${marks.length} one-color marks drawn light for the dark site redrawn in brand text: ${marks.slice(0, 6).join(', ')}${marks.length > 6 ? ', ...' : ''}`] : []),
					'',
					color.bold(`3. ${surface === 'product' ? 'Product theme' : 'Typefaces and frame'}:`),
					surface === 'product'
						? `   ${main ? `${dirname(main)}/${bin}/product.css: the dashboard's type scale, hairlines, card shadows, 15px root and canvas page${switches.length && theme === 'light' ? `; the product's dark theme follows the site's own switch (${switches.join(', ')})` : theme === 'dark' ? ', in the dark theme' : ''}` : 'no stylesheet: use the brand values for the platform (`' + cli + ' tokens --search <term>` lists them)'}${scoped ? `; .ds-product on <html> in ${scoped}` : ''}. No site frame: products use the app layout (app-shell, app-sidebar, app-page-header, app-page-column).${fontsIn ? ` Typefaces load through next/font in ${fontsIn}.` : project.framework !== 'next' && main ? ` Typefaces load at the top of ${main}.` : ''}`
						: `   ${project.framework === 'next' ? (fontsIn ? `typefaces load through next/font in ${fontsIn}` : 'add dsFontVariables from lib/ds-fonts to the <html> className in the root layout') : main ? `Rethink Sans, Doto and IBM Plex Mono load at the top of ${main}` : 'no main stylesheet found; load the typefaces in the base layout'}; ${main ? `the page frame (column rulers, section rules and nodes) is ${dirname(main)}/${bin}/frame.css` : 'no main stylesheet for the frame'}.`,
					...(nativeOnly ? ['   Native app: load Rethink Sans (and IBM Plex Mono for code, Doto for figures) as app fonts and set them on the text styles; radii, spacing and type sizes come from `' + cli + ' tokens`.'] : []),
					'',
					color.bold(`4. Raw values replaced with exact tokens: ${fixed.fixed}.`),
					'',
					color.bold(`5. Left for you (${remaining.reduce((a, [, n]) => a + n, 0)} errors in ${remaining.length} files):`),
					...(remaining.length
						? [...remaining.slice(0, 25).map(([f, n]) => `   ${String(n).padStart(4)}  ${f}`), remaining.length > 25 ? `   ... and ${remaining.length - 25} more` : '', `   Work through them: \`${cli} apply --list <file>\` shows each value and the token to use (\`${cli} tokens --search <term>\` to look one up). Replace the value with var(--ds-*); do not add overrides.`].filter(Boolean)
						: ['   nothing; every style uses the tokens.']),
					'',
					color.bold(`6. Components: restyle each with its recipe (${components.length} elements, ${byRecipe.size} recipes; ${surface === 'product' ? 'the app shell' : 'page structure'} first):`),
					...(components.length
						? [
								...groups.slice(0, 30).map(([recipe, list]) => `   ${recipe.padEnd(24)} ${list.slice(0, 4).map((c) => `${c.key} (${c.file}:${c.line})`).join(', ')}${list.length > 4 ? ` +${list.length - 4} more` : ''}`),
								groups.length > 30 ? `   ... and ${groups.length - 30} more recipes (\`${cli} style --detect <file>\` lists a file's)` : '',
								`   For each recipe: \`${cli} style <recipe>\` prints the brand's declarations for that element and situation (CSS and Tailwind), states included. Put them on the element's existing rule or classes; keep the element, its content and its place.`,
							].filter(Boolean)
						: [`   none recognized automatically. Match each element to a recipe yourself: \`${cli} style${surface === 'product' ? ' --surface product' : ''}\` lists them${kinds.native ? ', and translate its CSS into the platform\'s styling (SwiftUI modifiers, Compose modifiers, Flutter widgets)' : ''}.`]),
					'',
					color.bold('Styling only.') + ` Keep every word, link, image and element where it is; do not add templates, sections or components, and do not rewrite copy. Visual layout is styling: spacing, widths, alignment, borders and backgrounds follow the recipes (${surface === 'product' ? 'app-shell, app-sidebar, app-page-header, app-page-column, app-card, app-table' : 'page-column, section, header, the cards and buttons'}).`,
					color.bold('7. Look at it, then review it.') + ` Run the ${project.framework === 'next' ? 'app' : 'site'} and open every screen at desktop and phone width next to the brand (${surface === 'product' ? 'the dashboard: canvas page, white cards with hairline rings, compact type, black pill actions, blue accents' : 'white page, black text, blue accents, black pill buttons, ruled column'}). Then run \`${cli} review ${project.framework === 'next' ? '<route>' : 'http://localhost:<port>/<page>'}\` on each main screen and fix its punch list until every score is 7 or more.`,
					'   Common misses after a restyle: headlines too big on phones; text touching an edge or ruler; dark screenshots or videos left as black holes or fading into the white page (frame them instead); unreadable translucent headers; huge gaps or jammed sections; contrast on colored buttons and over images; touch targets under 44px.',
					`Then run \`${cli} apply --list\` until it is empty, and show the person the result before committing.`,
				].join('\n'),
			);
		});
}
