// Writes the docs site's illustration gallery (apps/www/public/illustrations) from `illustrate` itself, so the
// Illustrations page shows exactly what the command draws. Run after `npm run build`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { buildIllustration, illustrateData } from '../dist/illustrate/build.js';
import { encodePng } from '../dist/illustrate/png.js';
import { toPixels } from '../dist/illustrate/render.js';

const out = new URL('../apps/www/public/illustrations/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const { subjects, palettes } = illustrateData();
for (const [name, s] of Object.entries(subjects)) {
	// Pictures in a square frame; the mark, burst and kit artwork keep their own frames, scaled to fit 720px.
	const settings = s.kind === 'picture' ? { width: 720, height: 720, pad: 24 } : {};
	const ill = buildIllustration({ subject: name, settings }).illustration;
	const scale = Math.min(1, 720 / Math.max(ill.width, ill.height));
	writeFileSync(`${out}${name}.png`, encodePng(toPixels(ill, scale)));
}
for (const palette of Object.keys(palettes)) {
	const ill = buildIllustration({ subject: 'globe', settings: { width: 360, height: 360, pad: 12, palette, field: 'faint', empty: 'field' } }).illustration;
	writeFileSync(`${out}palette-${palette}.png`, encodePng(toPixels(ill, 1)));
}
console.log(`illustrations: ${Object.keys(subjects).length} subjects, ${Object.keys(palettes).length} palettes -> apps/www/public/illustrations`);
