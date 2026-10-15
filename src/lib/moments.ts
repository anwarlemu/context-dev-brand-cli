import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The brand's recognizable moments on a site, beyond its colors and type: the hero's dot field, the blue dot panel
// its one visual sits on, framed media, the key phrase of each headline in blue and figures in Doto. `apply` installs
// the script and styles for them (dots.js, dots.css); the markup has to opt in, so this reads which are still missing.

export type Moment = { id: 'field' | 'panel' | 'accent' | 'frame'; what: string; where: string[] };

const HEADLINE = /<h1\b|\bhero[-_]?title\b/i;
const MEDIA = /<(img|video|picture|Image|iframe)\b(?![^>]*(logo|avatar|icon|wordmark|lockup|favicon))/;

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
	if (!has(/data-ds-dots(?!=["'](panel|frame))/)) missing.push({ id: 'field', what: 'the hero has no dot field: add data-ds-dots to the hero section (the element around the headline)', where: heroes });
	if (!has(/data-ds-dots=["']panel/) && texts.some((f) => HEADLINE.test(f.text) && MEDIA.test(f.text.slice(f.text.search(HEADLINE)))))
		missing.push({ id: 'panel', what: 'the hero visual is not on the blue dot panel: add data-ds-dots="panel" to the element wrapping the hero screenshot, video or demo', where: heroes });
	if (!has(/\bds-accent\b/)) missing.push({ id: 'accent', what: 'no headline has its key phrase in blue: wrap the key phrase (the existing words) of the hero headline and each section heading in <span class="ds-accent">', where: [...heroes, ...places(/<h2\b/)].slice(0, 6) });
	if (!has(/data-ds-dots=["']frame/) && has(MEDIA)) missing.push({ id: 'frame', what: 'no screenshot or illustration is framed: add data-ds-dots="frame" to the element wrapping each standalone image or video (not logos or avatars)', where: places(MEDIA) });
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
