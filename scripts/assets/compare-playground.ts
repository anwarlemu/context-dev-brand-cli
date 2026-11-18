// Draws every image template at every main size twice, with the same inputs: once by the share-image editor's own
// code in a real browser (agd-playground src/components/context-og, bundled as is and run in Chromium), once by
// `src/assets/og.ts` headless, and lays the pairs side by side with a difference strip and a score, one sheet per
// template plus a palette sheet. Dev only: it needs a checkout of the playground and Chromium.
//
//   PLAYGROUND=../agd-playground CHROMIUM=/path/to/chrome npx tsx scripts/assets/compare-playground.ts <out-dir>

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { build } from 'esbuild';
import { loadImage } from '@napi-rs/canvas';
import { brandFonts, surface, toPng, pixelsOf, scratch } from '../../src/assets/canvas.js';
import { designFor, drawDesign, frameOf, imageDoc, TEMPLATES, type Design, type Template } from '../../src/assets/og.js';
import { samplePicture } from '../../src/assets/samples.js';
import { pkgPath } from '../../src/lib/paths.js';

const PG = resolve(process.env.PLAYGROUND ?? '');
const OUT = resolve(process.argv[2] ?? 'compare');
if (!process.env.PLAYGROUND) throw new Error('Set PLAYGROUND to a checkout of agd-playground.');
mkdirSync(OUT, { recursive: true });

// The editor's palettes by name, with its own hex, for the browser side.
const bundle = await build({
	stdin: { contents: `import * as D from ${JSON.stringify(join(PG, 'src/components/context-og/draw.ts'))}; window.D = D;`, resolveDir: PG, loader: 'ts' },
	bundle: true,
	format: 'iife',
	write: false,
	platform: 'browser',
});
const js = bundle.outputFiles[0]!.text;
const font = (file: string) => readFileSync(pkgPath('brand', 'fonts', file)).toString('base64');
// The editor loads Rethink Sans 400 and 500 and Doto 900 (next/font static instances); heavier weights are
// synthesized by the browser, as they are there.
const html = `<!doctype html><html><head><style>
@font-face{font-family:"PG Sans";font-weight:400;src:url(data:font/ttf;base64,${font('rethink-sans-400.ttf')})}
@font-face{font-family:"PG Sans";font-weight:500;src:url(data:font/ttf;base64,${font('rethink-sans-500.ttf')})}
@font-face{font-family:"PG Doto";font-weight:900;src:url(data:font/ttf;base64,${font('doto-900.ttf')})}
</style></head><body><script>${js}</script></body></html>`;

const { chromium } = await import('playwright-core');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM });
const page = await browser.newPage();
await page.setContent(html);
await page.evaluate(async () => {
	await Promise.all(['400 48px "PG Sans"', '500 48px "PG Sans"', '900 16px "PG Doto"'].map((f) => document.fonts.load(f)));
});

async function playground(d: Design, scale = 1): Promise<Buffer> {
	const url: string = await page.evaluate(
		async ({ d, scale }) => {
			const D = (window as any).D;
			const img = await D.loadImage(d.template === 'customer' ? d.partner : d.image);
			const L = D.frameOf(d);
			const c = document.createElement('canvas');
			c.width = L.w * scale;
			c.height = L.h * scale;
			D.drawDesign(c, d, img, { sans: '"PG Sans"', dot: '"PG Doto"' });
			return c.toDataURL('image/png');
		},
		{ d: { ...d, name: 'compare', partner: 'none' }, scale },
	);
	return Buffer.from(url.split(',')[1]!, 'base64');
}

function ours(d: Design): Buffer {
	const L = frameOf(d);
	const s = surface(L.w, L.h);
	const img = d.template === 'customer' ? null : d.image.startsWith('sample:') ? samplePicture(d.image)! : null;
	drawDesign(s.canvas, d, img, brandFonts());
	return toPng(s);
}

type Pair = { label: string; a: Buffer; b: Buffer; w: number; h: number };

/** Mean absolute difference per channel (0 to 100) and a heat strip of where they differ. */
async function diff(p: Pair) {
	const [ia, ib] = await Promise.all([loadImage(p.a), loadImage(p.b)]);
	const A = scratch(p.w, p.h);
	A.ctx.drawImage(ia, 0, 0);
	const B = scratch(p.w, p.h);
	B.ctx.drawImage(ib, 0, 0);
	const a = pixelsOf(A).data;
	const b = pixelsOf(B).data;
	const D = scratch(p.w, p.h);
	const img = D.ctx.createImageData(p.w, p.h);
	let sum = 0;
	let off = 0;
	for (let i = 0; i < a.length; i += 4) {
		const d = (Math.abs(a[i]! - b[i]!) + Math.abs(a[i + 1]! - b[i + 1]!) + Math.abs(a[i + 2]! - b[i + 2]!)) / 3;
		sum += d;
		if (d > 48) off++;
		const v = Math.min(255, d * 3);
		img.data[i] = 255;
		img.data[i + 1] = 255 - v;
		img.data[i + 2] = 255 - v;
		img.data[i + 3] = 255;
	}
	D.ctx.putImageData(img, 0, 0);
	return { mean: (sum / (a.length / 4) / 255) * 100, off: (off / (a.length / 4)) * 100, ia, ib, heat: D.canvas };
}

async function sheet(name: string, title: string, pairs: Pair[]) {
	const colW = 420;
	const rows = [];
	for (const p of pairs) rows.push({ p, h: Math.round((colW * p.h) / p.w), d: await diff(p) });
	const pad = 24;
	const W = pad + 3 * (colW + pad);
	const H = 90 + rows.reduce((n, r) => n + r.h + 54, 0);
	const s = surface(W, H);
	const { ctx } = s;
	const f = brandFonts();
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, W, H);
	ctx.fillStyle = '#000000';
	ctx.font = `500 22px ${f.sans}`;
	ctx.fillText(title, pad, 40);
	ctx.font = `400 14px ${f.sans}`;
	ctx.fillStyle = '#666666';
	ctx.fillText('Left: the playground’s own code in Chromium. Middle: context-ds (src/assets/og.ts, Skia). Right: difference (red where they differ).', pad, 66);
	let y = 90;
	const summary: { label: string; mean: number; off: number }[] = [];
	for (const { p, h, d } of rows) {
		ctx.fillStyle = '#000000';
		ctx.font = `500 15px ${f.sans}`;
		ctx.fillText(`${p.label}  ${p.w}×${p.h}   mean difference ${d.mean.toFixed(2)}%, pixels off ${d.off.toFixed(2)}%`, pad, y + 18);
		y += 30;
		[d.ia, d.ib, d.heat].forEach((im, i) => {
			const x = pad + i * (colW + pad);
			ctx.drawImage(im, x, y, colW, h);
			ctx.strokeStyle = '#E6E6E6';
			ctx.lineWidth = 1;
			ctx.strokeRect(x + 0.5, y + 0.5, colW - 1, h - 1);
		});
		y += h + 24;
		summary.push({ label: p.label, mean: d.mean, off: d.off });
	}
	writeFileSync(join(OUT, `${name}.png`), toPng(s));
	return summary;
}

const sizes = [...Object.keys(imageDoc().sizes), ...Object.keys(imageDoc().social)];
const all: Record<string, { label: string; mean: number; off: number }[]> = {};
for (const t of TEMPLATES) {
	const pairs: Pair[] = [];
	for (const size of sizes) {
		const d = designFor(t as Template, size);
		const L = frameOf(d);
		pairs.push({ label: `${t} at ${size}`, a: await playground(d), b: ours(d), w: L.w, h: L.h });
	}
	all[t] = await sheet(`compare-${t}`, `${t}: every main size, default copy and palette`, pairs);
}
// Palettes: the banner at og in each, on the editor's hex (left) and the tokens (middle).
const pairs: Pair[] = [];
for (const p of imageDoc().palettes) {
	const d = { ...designFor('banner', 'og'), palette: p.name, field: 'faint' as const };
	pairs.push({ label: `banner, ${p.name}`, a: await playground(d), b: ours(d), w: 1200, h: 630 });
}
all.palettes = await sheet('compare-palettes', 'Palettes: the editor’s hex against the nearest tokens (brand/assets/image.json notes)', pairs);
writeFileSync(join(OUT, 'compare.json'), `${JSON.stringify(all, null, 2)}\n`);
await browser.close();
for (const [k, v] of Object.entries(all)) console.log(k.padEnd(10), v.map((r) => r.mean.toFixed(2)).join(' '));
