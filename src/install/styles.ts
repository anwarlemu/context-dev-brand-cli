import { readFileSync } from 'node:fs';
import { dirname, posix, relative } from 'node:path';
import { brand, tokens } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import type { Project } from '../project/detect.js';
import type { Surface } from '../project/surface.js';
import type { Writer } from './files.js';

// The brand stylesheet: one file in the project's styles folder (tokens plus the site or product layer), imported once
// by the project's main stylesheet, or linked from each page when there is none. Fonts load with it (next/font in Next).

export type StyleInstall = { stylesDir: string; brandCss: string; imported?: string; linked: string[]; fonts: string; notes: string[] };

// The brand stylesheet folder starts with an underscore: Next's app router ignores such folders as routes, and the
// name cannot collide with a project's own page (an app may have a route named like this tool). Older installs used
// the bare name; both are recognized so a rerun moves them.
const STYLE_DIR = (bin: string) => `_${bin}`;
const IMPORT_RE = (bin: string) => new RegExp(`@import\\s+["']\\./_?${bin}/(?:brand|theme)\\.css["'];\\n?`, 'g');

export function installStyles(w: Writer, project: Project, surface: Surface, styleText: string): StyleInstall {
	const bin = brand().bin;
	const notes: string[] = [];
	const main = project.mainStylesheet;
	const stylesDir = main ? dirname(main) : project.framework === 'static' ? '.' : project.srcDir ? 'src/styles' : 'styles';
	const dir = posix.join(stylesDir, STYLE_DIR(bin));
	const next = project.framework === 'next';
	let css = readFileSync(pkgPath('build', surface === 'product' ? 'product.css' : 'site.css'), 'utf8');
	// A product whose dark theme follows the system setting gets the brand's dark values the same way.
	if (surface === 'product' && /prefers-color-scheme\s*:\s*dark/.test(styleText)) {
		const dark = Object.entries(tokens().dark).map(([k, v]) => `\t\t${k}: ${v};`).join('\n');
		css += `\n@media (prefers-color-scheme: dark) {\n\t:root {\n${dark}\n\t}\n}\n`;
	}
	// Next self-hosts the fonts through next/font; everything else loads them at the top of the brand stylesheet.
	if (!next) css = `${readFileSync(pkgPath('build', 'fonts.css'), 'utf8').split('\n').filter((l) => l.startsWith('@import')).join('\n')}\n${css}`;
	w.write(`${dir}/brand.css`, css);
	const tailwind4 = (project.tailwindMajor ?? 0) >= 4;
	if (tailwind4) w.write(`${dir}/theme.css`, readFileSync(pkgPath('build', 'theme.css'), 'utf8'));

	let imported: string | undefined;
	const linked: string[] = [];
	if (main) {
		const before = w.read(main) ?? '';
		let after = before.replace(IMPORT_RE(bin), '');
		const lines = [`@import "./${STYLE_DIR(bin)}/brand.css";`, ...(tailwind4 ? [`@import "./${STYLE_DIR(bin)}/theme.css";`] : [])];
		const tw = after.match(/@import\s+["']tailwindcss["'][^;]*;/);
		if (tw) after = after.replace(tw[0], `${tw[0]}\n${lines.join('\n')}`);
		else {
			// @import must come first: after a @charset and leading comments, before any rule.
			const lead = after.match(/^(?:\s*(?:@charset[^;]*;|\/\*[\s\S]*?\*\/|@import[^;]*;))*/)?.[0] ?? '';
			after = `${lead}${lead && !lead.endsWith('\n') ? '\n' : ''}${lines.join('\n')}\n${after.slice(lead.length).replace(/^\n/, '')}`;
		}
		if (w.write(main, after)) imported = main;
		else if (before.includes(`./${STYLE_DIR(bin)}/brand.css`)) imported = main;
	} else {
		// No global stylesheet: every page links the brand stylesheet in its <head>.
		for (const rel of project.layouts.filter((l) => !/\.(tsx|jsx|js)$/.test(l))) {
			const text = w.read(rel) ?? '';
			if (text.includes(`${STYLE_DIR(bin)}/brand.css`)) {
				linked.push(rel);
				continue;
			}
			const href = posix.relative(posix.dirname(rel), `${dir}/brand.css`) || 'brand.css';
			if (w.write(rel, text.replace(/<\/head>/i, `<link rel="stylesheet" href="${href.startsWith('.') ? href : `./${href}`}">\n</head>`))) linked.push(rel);
		}
		if (!linked.length) notes.push(`No global stylesheet or page <head> found: load ${dir}/brand.css from the base layout.`);
	}
	const fonts = next ? wireNextFonts(w, project) : project.native ? 'app fonts' : 'brand.css';
	if (project.native) notes.push('Add Rethink Sans (text), IBM Plex Mono (code) and Doto (figures) to the app as fonts and set them on its text styles.');
	return { stylesDir, brandCss: `${dir}/brand.css`, imported, linked, fonts, notes };
}

/** Next: a next/font loader for the three typefaces, added to the root layout's <html> className. */
/**
 * Adds an import line after a file's last import statement: with or without semicolons, on one line or several,
 * never into a comment that follows them; after a "use client" directive when there are no imports.
 */
export function insertAfterImports(text: string, line: string) {
	const last = [...text.matchAll(/^import[^\n]*?(?:from\s+["'][^"'\n]+["']|^import\s+["'][^"'\n]+["'])[^\n]*\n|^import\s*(?:type\s+)?\{[^}]*\}\s*from\s+["'][^"'\n]+["'][^\n]*\n|^import\s+["'][^"'\n]+["'][^\n]*\n/gm)].pop();
	if (last) return text.slice(0, last.index! + last[0].length) + `${line}\n` + text.slice(last.index! + last[0].length);
	const directive = text.match(/^\s*["']use (client|server)["'];?\n/);
	return directive ? `${directive[0]}${line}\n${text.slice(directive[0].length)}` : `${line}\n${text}`;
}

function wireNextFonts(w: Writer, project: Project) {
	const libDir = project.srcDir && !project.appDir?.startsWith('app') ? 'src/lib' : 'lib';
	const loader = `${libDir}/ds-fonts.${project.typescript ? 'ts' : 'js'}`;
	w.write(loader, "import { Doto, IBM_Plex_Mono, Rethink_Sans } from 'next/font/google';\n\nconst rethinkSans = Rethink_Sans({ subsets: ['latin'], variable: '--font-rethink-sans' });\nconst doto = Doto({ subsets: ['latin'], variable: '--font-doto' });\nconst ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-ibm-plex-mono' });\n\nexport const dsFontVariables = `${rethinkSans.variable} ${doto.variable} ${ibmPlexMono.variable}`;\n");
	const layout = project.layouts.find((l) => /\/layout\.(tsx|jsx|js)$/.test(l));
	if (!layout) return loader;
	const text = w.read(layout) ?? '';
	if (text.includes('dsFontVariables')) return layout;
	const from = project.hasAlias ? `@/${libDir.replace(/^src\//, '')}/ds-fonts` : relative(dirname(layout), `${libDir}/ds-fonts`).split('\\').join('/').replace(/^(?!\.)/, './');
	let next = text.replace(/<html\b([^>]*?)\bclassName=(\{`([^`]*)`\}|\{([^}]+)\}|"([^"]*)")/, (all, pre: string, _v: string, tpl?: string, expr?: string, str?: string) => {
		const inner = tpl !== undefined ? tpl : expr !== undefined ? `\${${expr.trim()}}` : str;
		return `<html${pre}className={\`\${dsFontVariables} ${inner}\`}`;
	});
	if (next === text) next = text.replace(/<html\b/, '<html className={dsFontVariables}');
	if (next === text) return loader;
	next = insertAfterImports(next, `import { dsFontVariables } from '${from}';`);
	w.write(layout, next);
	return layout;
}

/** The dots script for a site's hero, served as a static file and loaded by every base layout. */
export function installDots(w: Writer, project: Project) {
	const bin = brand().bin;
	if (!project.publicDir) return [];
	w.write(posix.join(project.publicDir, bin, 'dots.js'), readFileSync(pkgPath('brand', 'dots.js'), 'utf8'));
	const url = project.publicDir === '.' ? `./${bin}/dots.js` : `/${bin}/dots.js`;
	const wired: string[] = [];
	for (const rel of project.layouts) {
		const text = w.read(rel) ?? '';
		if (text.includes(`${bin}/dots.js`)) {
			wired.push(rel);
			continue;
		}
		const jsx = /\.(tsx|jsx|js)$/.test(rel);
		const close = jsx ? '</body>' : '</head>';
		if (!text.includes(close)) continue;
		// React hoists and dedupes an async script; Astro would try to bundle a script without is:inline.
		const local = posix.relative(posix.dirname(rel), `${bin}/dots.js`) || `${bin}/dots.js`;
		const src = project.publicDir === '.' ? (local.startsWith('.') ? local : `./${local}`) : url;
		// In Next, the script loads after hydration (it adds the dot layers to the hero, which React would otherwise see
		// as a mismatch); elsewhere a deferred script.
		const next = project.framework === 'next' && jsx;
		const tag = next ? `<DsScript src="${url}" strategy="afterInteractive" />` : jsx ? `<script src="${url}" async />` : `<script${rel.endsWith('.astro') ? ' is:inline' : ''} src="${src}" defer></script>`;
		let out = text.replace(close, `${tag}\n${close}`);
		if (next) out = insertAfterImports(out, 'import DsScript from "next/script";');
		if (w.write(rel, out)) wired.push(rel);
	}
	return wired;
}
