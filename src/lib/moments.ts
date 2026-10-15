import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The brand's two signature touches on a site, beyond its colors and type, as the site's redesign uses them: the
// hero's dot streams running in from its edges, and the key phrase of a headline in blue. `apply` installs the script
// and styles (dots.js, dots.css); the markup has to opt in, so this reads which are still missing. Nothing more: the
// pattern is a supporting texture, and screenshots keep the plain media frame.

export type Moment = { id: 'field' | 'accent'; what: string; where: string[] };

const HEADLINE = /<h1\b|\bhero[-_]?title\b/i;

function lineOf(text: string, at: number) {
	return text.slice(0, at).split('\n').length;
}

/** Moments a marketing site should have and does not yet, each with where to add it. */
export function missingMoments(root: string, files: string[]): Moment[] {
	// The home page first: it is where the person looks for the brand.
	const ordered = [...files].sort((a, b) => Number(!/(^|\/)(index|home|page)\.\w+$/.test(a)) - Number(!/(^|\/)(index|home|page)\.\w+$/.test(b)));
	const texts = ordered.filter((rel) => !/(^|\/)(nav|header|footer|navbar|topbar)[^/]*$/i.test(rel)).map((rel) => ({ rel, text: existsSync(join(root, rel)) ? readFileSync(join(root, rel), 'utf8') : '' }));
	const has = (re: RegExp) => texts.some((f) => re.test(f.text));
	const places = (re: RegExp, max = 4) =>
		texts.flatMap((f) => {
			const m = re.exec(f.text);
			return m ? [`${f.rel}:${lineOf(f.text, m.index)}`] : [];
		}).slice(0, max);
	const missing: Moment[] = [];
	const heroes = places(HEADLINE);
	if (!heroes.length) return missing;
	if (!has(/\bdata-ds-dots\b/)) missing.push({ id: 'field', what: 'the home hero has no dot streams: add data-ds-dots to the hero section (the element around the headline)', where: heroes.slice(0, 1) });
	if (!has(/\bds-accent\b/)) missing.push({ id: 'accent', what: 'no headline has its key phrase in blue: wrap the key phrase (the existing words) of the hero headline and section headings in <span class="ds-accent">', where: [...heroes, ...places(/<h2\b/)].slice(0, 6) });
	return missing;
}

/** Adds the dots script to every base layout (files with a </head>), served from the public folder. */
export function wireDots(root: string, files: string[], publicUrl: string, dryRun: boolean, write: (rel: string, text: string) => void) {
	const wired: string[] = [];
	for (const rel of files) {
		const text = readFileSync(join(root, rel), 'utf8');
		if (text.includes(publicUrl)) {
			wired.push(rel);
			continue;
		}
		const jsx = /\.(tsx|jsx|js)$/.test(rel);
		const close = jsx ? '</body>' : '</head>';
		if (!text.includes(close)) continue;
		// React hoists and dedupes an async script; Astro would try to bundle a script without is:inline.
		const tag = jsx ? `<script src="${publicUrl}" async />` : `<script${rel.endsWith('.astro') ? ' is:inline' : ''} src="${publicUrl}" defer></script>`;
		const next = text.replace(close, `${tag}\n${close}`);
		if (!dryRun) write(rel, next);
		wired.push(rel);
	}
	return wired;
}
