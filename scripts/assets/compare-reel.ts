// The reel at a few times, twice: the playground's own page (/context-reel?render on a running dev server) and the
// video command's bundle, side by side in one sheet. Dev only.
//
//   PLAYGROUND_URL=http://localhost:3850 CHROMIUM=/path/to/chrome npx tsx scripts/assets/compare-reel.ts <out-dir>

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadImage } from '@napi-rs/canvas';
import { brandFonts, surface, toPng } from '../../src/assets/canvas.js';
import { reelFrames } from '../../src/assets/video.js';

const OUT = resolve(process.argv[2] ?? 'compare');
const BASE = process.env.PLAYGROUND_URL ?? 'http://localhost:3850';
const TIMES = [0.6, 1.8, 3.5, 5.5, 6.9, 7.8, 8.9, 9.8];
mkdirSync(OUT, { recursive: true });

const { chromium } = await import('playwright-core');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(`${BASE}/context-reel?render`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => (window as any).__reelReady === true);
const theirs: Buffer[] = [];
for (const t of TIMES) {
	await page.evaluate((at) => (window as any).__seek(at), t);
	theirs.push(await page.locator('#cx-stage').screenshot({ type: 'png', animations: 'disabled' }));
}
await browser.close();
const ours: Buffer[] = [];
await reelFrames({}, 30, (png) => void ours.push(png), TIMES);

const cw = 760;
const ch = Math.round((cw * 1080) / 1920);
const W = 24 + 2 * (cw + 24);
const H = 90 + TIMES.length * (ch + 50);
const s = surface(W, H);
const f = brandFonts();
s.ctx.fillStyle = '#FFFFFF';
s.ctx.fillRect(0, 0, W, H);
s.ctx.fillStyle = '#000000';
s.ctx.font = `500 22px ${f.sans}`;
s.ctx.fillText('Reel: the playground (left) and the video command (right) at the same times', 24, 40);
s.ctx.font = `400 14px ${f.sans}`;
s.ctx.fillStyle = '#666666';
s.ctx.fillText('Expected differences: Rethink Sans for Switzer and Geist Mono (tokens), token colors, Acme for third-party names.', 24, 66);
for (const [i, t] of TIMES.entries()) {
	const y = 90 + i * (ch + 50);
	s.ctx.fillStyle = '#000000';
	s.ctx.font = `500 15px ${f.sans}`;
	s.ctx.fillText(`t = ${t} s`, 24, y + 18);
	s.ctx.drawImage(await loadImage(theirs[i]!), 24, y + 28, cw, ch);
	s.ctx.drawImage(await loadImage(ours[i]!), 48 + cw, y + 28, cw, ch);
}
writeFileSync(join(OUT, 'compare-reel.png'), toPng(s));
console.log(join(OUT, 'compare-reel.png'));
