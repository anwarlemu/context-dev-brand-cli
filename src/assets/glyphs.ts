import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';

// Which characters the brand's faces can draw, read from their own tables. Anything else would be drawn in whatever
// face the machine has, which is neither the brand's nor the same everywhere, so it is refused with its name.

type FontDoc = Record<'sans' | 'data', { family: string; files: Record<string, string> }>;
const cache = new Map<string, (cp: number) => boolean>();

function covers(file: string): (cp: number) => boolean {
	const hit = cache.get(file);
	if (hit) return hit;
	const b = readFileSync(file);
	const tables = b.readUInt16BE(4);
	let cmap = 0;
	for (let i = 0; i < tables; i++) if (b.toString('latin1', 12 + i * 16, 16 + i * 16) === 'cmap') cmap = b.readUInt32BE(12 + i * 16 + 8);
	const tests: ((cp: number) => boolean)[] = [];
	for (let i = 0; i < b.readUInt16BE(cmap + 2); i++) {
		const at = cmap + b.readUInt32BE(cmap + 4 + i * 8 + 4);
		const format = b.readUInt16BE(at);
		if (format === 4) {
			const n = b.readUInt16BE(at + 6) / 2;
			const end = at + 14;
			const start = end + n * 2 + 2;
			const delta = start + n * 2;
			const range = delta + n * 2;
			tests.push((cp) => {
				if (cp > 0xffff) return false;
				for (let s = 0; s < n; s++) {
					if (cp > b.readUInt16BE(end + s * 2)) continue;
					const from = b.readUInt16BE(start + s * 2);
					if (cp < from) return false;
					const ro = b.readUInt16BE(range + s * 2);
					const glyph = ro ? b.readUInt16BE(range + s * 2 + ro + (cp - from) * 2) : cp;
					return glyph !== 0 && ((glyph + b.readUInt16BE(delta + s * 2)) & 0xffff) !== 0;
				}
				return false;
			});
		} else if (format === 12) {
			const n = b.readUInt32BE(at + 12);
			tests.push((cp) => {
				for (let g = 0; g < n; g++) {
					const o = at + 16 + g * 12;
					if (cp >= b.readUInt32BE(o) && cp <= b.readUInt32BE(o + 4)) return b.readUInt32BE(o + 8) + cp - b.readUInt32BE(o) !== 0;
				}
				return false;
			});
		}
	}
	const test = (cp: number) => tests.some((t) => t(cp));
	cache.set(file, test);
	return test;
}

/** The characters of `text` the face has no letters for. */
export function missingGlyphs(text: string, face: 'sans' | 'data' = 'sans'): string[] {
	const doc = JSON.parse(readFileSync(pkgPath('brand', 'fonts', 'fonts.json'), 'utf8')) as FontDoc;
	const file = pkgPath('brand', 'fonts', Object.values(doc[face].files)[0]!);
	const has = covers(file);
	return [...new Set([...text.normalize('NFC')])].filter((ch) => !/\s/.test(ch) && !has(ch.codePointAt(0)!));
}

/** Throws when the face cannot draw every character of `text`. */
export function assertGlyphs(what: string, text: string, face: 'sans' | 'data' = 'sans') {
	const gone = missingGlyphs(text, face);
	if (!gone.length) return;
	const emoji = gone.filter((c) => /\p{Extended_Pictographic}/u.test(c));
	throw new Error(`The brand's type has no letters for ${gone.map((c) => `"${c}"`).slice(0, 8).join(', ')} in the ${what}${emoji.length === gone.length ? ': emoji are not part of it. Take them out.' : '. It draws Latin letters, numbers and marks. Write it in those.'}`);
}
