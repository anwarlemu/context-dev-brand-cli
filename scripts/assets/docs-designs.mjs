// Writes the Designs page's sequence into apps/www/public/designs by running `design` itself (built first): a new X
// header, revisions in plain words, a refused request, an undo, variants and other sizes. Rerun after a layout change:
// node scripts/assets/docs-designs.mjs
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const root = new URL('../..', import.meta.url).pathname;
const bin = join(root, 'bin.js');
const out = join(root, 'apps', 'www', 'public', 'designs');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'ds-docs-designs-'));
const run = (...args) => {
	const r = spawnSync(process.execPath, [bin, 'design', ...args], { cwd: work, encoding: 'utf8' });
	return { code: r.status, text: (r.stdout + r.stderr).trim() };
};
async function jpeg(src, name, width) {
	const img = await loadImage(readFileSync(join(work, src)));
	const h = Math.round((width * img.height) / img.width);
	const c = createCanvas(width, h);
	c.getContext('2d').drawImage(img, 0, 0, width, h);
	writeFileSync(join(out, name), await c.encode('jpeg', 86));
	return { src: `/designs/${name}`, width, height: h };
}
const quote = (a) => a.map((x) => (/[\s"]/.test(x) ? JSON.stringify(x) : x)).join(' ');
const steps = [];
const step = async (args, note) => {
	const r = run(...args);
	const n = String(steps.length + 1).padStart(2, '0');
	steps.push({ command: `design ${quote(args)}`, note, ok: r.code === 0, output: r.text.split('\n').slice(0, 4).join('\n'), ...(r.code === 0 ? await jpeg('banner.png', `step-${n}.jpg`, 900) : {}) });
};
await step(['new', 'banner', '--size', 'x-banner', '--headline', 'The web data APIs for agents', '-o', 'banner.design.json'], 'A new X header: the words fit the space X shows, clear of the profile picture.');
await step(['revise', 'banner.design.json', 'bigger headline, logo top right'], 'Plain words, read by rules: larger type that re-wraps, and the logo in another corner.');
await step(['revise', 'banner.design.json', 'darker theme, add a badge "New"'], 'The next darker theme of the brand, and a label in its own chip.');
await step(['revise', 'banner.design.json', 'make the logo neon green'], 'Off brand: refused, nothing changes, and it says why.');
await step(['revise', 'banner.design.json', 'body "Search, scrape and crawl the live web from one API"'], 'A line under the headline; the layout makes room.');
await step(['undo', 'banner.design.json'], 'Undo takes back the last change exactly.');
const v = run('variants', 'banner.design.json', '--by', 'theme');
const sz = run('sizes', 'banner.design.json', '--to', 'og,square,story,linkedin-banner');
const extra = {
	variants: v.code === 0 ? { command: 'design variants banner.design.json --by theme', ...(await jpeg('banner-by-theme.png', 'variants.jpg', 1200)) } : undefined,
	sizes: sz.code === 0 ? { command: 'design sizes banner.design.json --to og,square,story,linkedin-banner', ...(await jpeg('banner-sizes.png', 'sizes.jpg', 1200)) } : undefined,
};
writeFileSync(join(out, 'designs.json'), `${JSON.stringify({ steps, ...extra }, null, '\t')}\n`);
rmSync(work, { recursive: true, force: true });
console.log(`designs: ${steps.length} steps in apps/www/public/designs`);
