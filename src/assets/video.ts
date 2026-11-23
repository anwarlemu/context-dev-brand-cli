import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Path2D } from '@napi-rs/canvas';
import { pkgPath } from '../lib/paths.js';
import { launch } from '../review/capture.js';
import { brandFonts, pixelsOf, surface, tokenColor, toPng, type Ctx } from './canvas.js';
import type { DrawnLayer } from '../design/index.js';
import { assertGlyphs } from './glyphs.js';
import { pick, write } from './io.js';
import { drawLogo, logoClear, logoRatio } from './logo.js';
import { paletteOf, palettes } from './og.js';
import { fit, drawFitted } from './text.js';

// Video: the reel (the playground's ten seconds, bundled at build into build/assets/reel.js and drawn frame by frame
// in headless Chromium) and short dot-field loops drawn here on the canvas. Every frame is a pure function of its time,
// so the same inputs give the same frames. ffmpeg encodes MP4 (H.264) and WebM (VP9) when it is on the PATH; without
// it, the frames are written as PNG.

type ReelDoc = { seconds: number; width: number; height: number; fps: number; copy: ReelCopy; colors: Record<string, string>; notes: string[] };
export type ReelCopy = { name: string; headline: string; url: string; tagline: string; markdown: string; quote: string; attribution: string; statValue: number; statLabel: string; cardBlue: string; cardTop: [string, string]; cardBottom: [string, string]; pills: string[]; bench: string[] };
export type LoopTemplate = 'edges' | 'twinkle' | 'ripple' | 'logo';
type LoopDoc = { seconds: number; fps: number; sizes: Record<string, [number, number]>; templates: Record<LoopTemplate, { name: string; description: string; palette: string }> };
type VideoDoc = { reel: ReelDoc; loops: LoopDoc };

let doc: VideoDoc | undefined;
export const videoDoc = (): VideoDoc => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'video.json'), 'utf8')) as VideoDoc);
export const loopTemplates = () => Object.keys(videoDoc().loops.templates) as LoopTemplate[];

export function hasFfmpeg(): boolean {
	if (process.env.DS_NO_FFMPEG) return false;
	return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
}

export function videoCatalog() {
	const d = videoDoc();
	return {
		reel: { id: 'reel', seconds: d.reel.seconds, width: d.reel.width, height: d.reel.height, fps: d.reel.fps, copy: Object.keys(d.reel.copy), needs: 'Chromium (playwright-core), as review does', notes: d.reel.notes },
		loops: {
			templates: loopTemplates().map((id) => ({ id, ...d.loops.templates[id] })),
			sizes: Object.entries(d.loops.sizes).map(([id, [width, height]]) => ({ id, width, height })),
			seconds: d.loops.seconds,
			fps: d.loops.fps,
		},
		formats: ['mp4', 'webm', 'frames', 'all'],
		encoder: 'ffmpeg (H.264 MP4, VP9 WebM) when installed; otherwise PNG frames.',
	};
}

// ----- Loops -----

/** Stable per-cell noise in [0, 1) (the brand film's hash). */
function noise(x: number, y: number, seed = 7) {
	let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export type LoopOptions = { template: LoopTemplate; width: number; height: number; palette?: string; seed?: number; headline?: string; seconds: number };

/** One frame of a loop at phase `p` (0 to 1; 1 meets 0). */
export function drawLoopFrame(ctx: Ctx, o: LoopOptions, p: number) {
	const t = pick('template', o.template, loopTemplates());
	const pal = paletteOf({ palette: o.palette ? pick('palette', o.palette, palettes().map((x) => x.name)) : videoDoc().loops.templates[t].palette });
	const { width: W, height: H } = o;
	const seed = o.seed ?? 0;
	const k = Math.min(W, H) / 1080;
	const TAU = Math.PI * 2;
	ctx.fillStyle = pal.bg;
	ctx.fillRect(0, 0, W, H);
	// The film's DotField: one grid, radius 0.32 of the pitch, cells kept by noise.
	const pitch = (t === 'edges' ? 16 : t === 'ripple' ? 30 : 48) * k * (t === 'edges' ? 1.5 : 1);
	const cols = Math.ceil(W / pitch);
	const rows = Math.ceil(H / pitch);
	const r0 = pitch * (t === 'edges' ? 0.32 : t === 'ripple' ? 0.22 : 0.075);
	const keepBox = t === 'logo' ? logoBox(W, H, o.headline, ctx) : undefined;
	const base = new Path2D();
	const bright: { x: number; y: number; r: number; a: number }[] = [];
	for (let row = 0; row < rows; row++)
		for (let col = 0; col < cols; col++) {
			const cx = col * pitch + pitch / 2;
			const cy = row * pitch + pitch / 2;
			const n = noise(col, row, 7 + seed);
			if (keepBox && cx > keepBox.x - pitch && cx < keepBox.x + keepBox.w + pitch && cy > keepBox.y - pitch && cy < keepBox.y + keepBox.h + pitch) continue;
			if (t === 'edges') {
				// Dots near the left and right edges, fraying toward the content; the fray line breathes.
				const edge = Math.min(cx, W - cx) / W;
				const breathe = 0.5 + 0.5 * Math.sin(TAU * (p + noise(col, row, 11 + seed) * 0.25));
				if (n > 0.35 + edge * (4.5 - 1.2 * breathe)) {
					base.moveTo(cx + r0, cy);
					base.arc(cx, cy, r0, 0, TAU);
				}
			} else if (t === 'ripple') {
				// Rings spread from the center: each dot's size follows a sine of its distance minus time.
				const d = Math.hypot(cx - W / 2, cy - H / 2) / (Math.max(W, H) * 0.5);
				const wave = Math.max(0, Math.sin(TAU * (d * 1.6 - p * 2)));
				const r = r0 * (0.55 + 0.9 * wave ** 3);
				if (wave > 0.6) bright.push({ x: cx, y: cy, r, a: 1 });
				else {
					base.moveTo(cx + r, cy);
					base.arc(cx, cy, r, 0, TAU);
				}
			} else {
				// The reel's cover: a faint grid, some dots pulsing on periods that divide the loop.
				if (n < 0.07) {
					const beats = 1 + Math.floor(noise(col, row, 3 + seed) * 3);
					const pulse = Math.max(0, Math.sin(TAU * (p * beats + noise(col, row, 5 + seed))));
					bright.push({ x: cx, y: cy, r: r0 * 1.2 * (1 + 0.9 * pulse), a: 0.35 + 0.65 * pulse });
				} else {
					base.moveTo(cx + r0 * 1.2, cy);
					base.arc(cx, cy, r0 * 1.2, 0, TAU);
				}
			}
		}
	ctx.save();
	if (t === 'edges') {
		ctx.globalAlpha = pal.bg === tokenColor('white') ? 0.14 : 0.3;
		ctx.fillStyle = pal.ink;
	} else if (t === 'ripple') {
		ctx.globalAlpha = 1;
		ctx.fillStyle = pal.field;
	} else {
		ctx.globalAlpha = 0.32;
		ctx.fillStyle = pal.ink;
	}
	ctx.fill(base);
	ctx.restore();
	for (const b of bright) {
		ctx.save();
		ctx.globalAlpha = b.a;
		ctx.fillStyle = t === 'ripple' ? pal.fill : pal.ink;
		ctx.beginPath();
		ctx.arc(b.x, b.y, b.r, 0, TAU);
		ctx.fill();
		ctx.restore();
	}
	if (keepBox) {
		drawLogo(ctx, keepBox.logo.x, keepBox.logo.y, keepBox.logo.h, pal.mark, pal.ink);
		if (keepBox.line) drawFitted(ctx, { ...keepBox.line, style: { ...keepBox.line.style, color: pal.ink } }, 0, keepBox.logo.y + keepBox.logo.h + 44 * k, W);
	}
}

function logoBox(W: number, H: number, headline: string | undefined, ctx: Ctx) {
	const k = Math.min(W, H) / 1080;
	const lh = 96 * k;
	const lw = logoRatio() * lh;
	const fonts = brandFonts();
	const line = headline ? fit(ctx, headline, { family: fonts.sans, weight: 500, size: 46 * k, tracking: -0.02, leading: 1.2, align: 'center' }, W * 0.8, 2, 0.6, 'headline') : undefined;
	const h = lh + (line ? 44 * k + line.height : 0);
	const y = (H - h) / 2;
	return { x: Math.min((W - lw) / 2, line ? (W - line.width) / 2 : Infinity), y, w: Math.max(lw, line?.width ?? 0), h, logo: { x: (W - lw) / 2, y, h: lh }, line };
}

/** The loop's frames as straight RGBA buffers, one at a time. */
export function* loopFrames(o: LoopOptions & { fps: number }): Generator<{ index: number; rgba: Buffer; png: () => Buffer }> {
	const count = Math.round(o.seconds * o.fps);
	for (let i = 0; i < count; i++) {
		const s = surface(o.width, o.height);
		drawLoopFrame(s.ctx, o, i / count);
		yield { index: i, rgba: pixelsOf(s).data, png: () => toPng(s, { opaque: true }) };
	}
}

/** What a loop holds still: the logo and the line under it. The dots run off the frame by design. */
export function loopLayers(o: LoopOptions): DrawnLayer[] {
	const t = pick('template', o.template, loopTemplates());
	const pal = paletteOf({ palette: o.palette ?? videoDoc().loops.templates[t].palette });
	const layers: DrawnLayer[] = [{ id: 'art', kind: 'art', box: { x: 0, y: 0, w: o.width, h: o.height }, ink: [{ x: 0, y: 0, w: 1, h: 1 }], bleeds: true, can: {} }];
	if (t !== 'logo') return layers;
	const s = surface(o.width, o.height);
	const b = logoBox(o.width, o.height, o.headline, s.ctx);
	const k = Math.min(o.width, o.height) / 1080;
	layers.push({ id: 'logo', kind: 'logo', box: { x: b.logo.x, y: b.logo.y, w: logoRatio() * b.logo.h, h: b.logo.h }, logo: { clear: logoClear(b.logo.h), min: 24 * k }, can: {} });
	if (b.line) layers.push({ id: 'headline', kind: 'text', box: { x: (o.width - b.line.width) / 2, y: b.logo.y + b.logo.h + 44 * k, w: b.line.width, h: b.line.height }, text: { asked: o.headline!, drawn: b.line.lines.join('\n'), size: b.line.size, color: pal.ink, ground: [pal.bg] }, can: {} });
	return layers;
}

// ----- Encoding -----

export type Encoded = { path: string; format: string };

/** Pipes raw RGBA frames (or PNGs) into one ffmpeg run that writes each asked format. */
export async function encode(frames: AsyncIterable<Buffer> | Iterable<Buffer>, o: { width: number; height: number; fps: number; input: 'rgba' | 'png'; outputs: { path: string; format: 'mp4' | 'webm' }[] }): Promise<Encoded[]> {
	for (const out of o.outputs) mkdirSync(dirname(out.path), { recursive: true });
	const args = ['-y', '-loglevel', 'error'];
	if (o.input === 'rgba') args.push('-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${o.width}x${o.height}`, '-r', String(o.fps), '-i', '-');
	else args.push('-f', 'image2pipe', '-framerate', String(o.fps), '-c:v', 'png', '-i', '-');
	for (const out of o.outputs) {
		args.push('-map_metadata', '-1', '-fflags', '+bitexact', '-flags:v', '+bitexact');
		if (out.format === 'mp4') args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-threads', '1', '-movflags', '+faststart', out.path);
		else args.push('-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '28', '-pix_fmt', 'yuv420p', '-row-mt', '0', '-threads', '1', out.path);
	}
	const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] });
	let err = '';
	ff.stderr.on('data', (d) => (err += d));
	const done = new Promise<number>((res) => ff.on('close', (code) => res(code ?? 1)));
	let closed = false;
	ff.stdin.on('error', () => (closed = true));
	ff.on('close', () => (closed = true));
	for await (const f of frames as AsyncIterable<Buffer>) {
		if (closed) break;
		if (!ff.stdin.write(f)) await Promise.race([new Promise((r) => ff.stdin.once('drain', r)), done]);
	}
	ff.stdin.end();
	const code = await done;
	if (code !== 0) throw new Error(`ffmpeg failed: ${err.trim() || `exit ${code}`}`);
	return o.outputs.map((x) => ({ path: x.path, format: x.format }));
}

// ----- The reel -----

export type ReelSlot = { id: string; key: keyof ReelCopy; flag: string; own?: boolean; description: string };
/** The reel's words. The name and address are the brand's own; every other one has to be passed (or --sample). */
export function reelCopySlots(): ReelSlot[] {
	return [
		{ id: 'headline', key: 'headline', flag: 'headline', description: 'the end card line' },
		{ id: 'tagline', key: 'tagline', flag: 'tagline', description: 'the tagline tile (*word* sets a word in the brand color)' },
		{ id: 'markdown', key: 'markdown', flag: 'markdown', description: 'the Markdown tile\'s sentence' },
		{ id: 'quote', key: 'quote', flag: 'quote', description: 'the testimonial' },
		{ id: 'attribution', key: 'attribution', flag: 'attribution', description: 'who said it (a role and a company)' },
		{ id: 'stat', key: 'statValue', flag: 'stat', description: 'the stat tile\'s percentage, 0 to 100' },
		{ id: 'stat-label', key: 'statLabel', flag: 'statLabel', description: 'the line beside it' },
		{ id: 'card', key: 'cardBlue', flag: 'card', description: 'the blue card\'s sentence' },
		{ id: 'card-top', key: 'cardTop', flag: 'cardTop', description: 'the white card\'s two lines, with | between' },
		{ id: 'card-bottom', key: 'cardBottom', flag: 'cardBottom', description: 'the black card\'s two lines, with | between' },
		{ id: 'pills', key: 'pills', flag: 'pills', description: 'three short words, with | between' },
		{ id: 'bench', key: 'bench', flag: 'bench', description: 'the comparison, "name share" rows with | between, yours first (share 0 to 100)' },
		{ id: 'url', key: 'url', flag: 'url', own: true, description: 'the address on the end card (the brand\'s own by default)' },
	];
}

/** The reel's copy from slots, whole: a missing one is an error, because nothing is made up for it. */
export function checkReel(given: Record<string, string | undefined>): Partial<ReelCopy> {
	const out: Record<string, unknown> = {};
	const missing: string[] = [];
	for (const s of reelCopySlots()) {
		const v = given[s.id];
		if (v === undefined || !v.trim()) {
			if (!s.own) missing.push(s.id);
			continue;
		}
		const def = videoDoc().reel.copy[s.key];
		if (Array.isArray(def)) {
			const parts = v.split('|').map((x) => x.trim()).filter(Boolean);
			if (parts.length !== def.length) throw new Error(`The reel's ${s.id} takes ${def.length} parts with | between, not ${parts.length}.`);
			if (s.id === 'bench') for (const r of parts) if (!/\S\s+(100|\d{1,2})$/.test(r)) throw new Error(`The reel's bench rows are "name share", share 0 to 100; "${r}" is not.`);
			out[s.key] = parts;
		} else if (typeof def === 'number') {
			const n = Number(v);
			if (!Number.isInteger(n) || n < 0 || n > 100) throw new Error(`The reel's ${s.id} takes a whole number from 0 to 100, not ${v}.`);
			out[s.key] = n;
		} else out[s.key] = v;
		for (const text of [out[s.key]].flat()) assertGlyphs(`reel's ${s.id}`, String(text).replace(/\*/g, ''));
		if (v.length > LIMIT[s.id]!) throw new Error(`The reel's ${s.id} is too long for its tile (${v.length} characters; up to ${LIMIT[s.id]}). Shorten it.`);
	}
	if (missing.length) throw new Error(`The reel needs ${missing.map((m) => `--${m}`).join(', ')}. Nothing is made up for it; --sample fills in sample copy.`);
	return out;
}
/** How many characters each tile holds at its fixed size (measured on the tiles). */
const LIMIT: Record<string, number> = { headline: 40, tagline: 44, markdown: 70, quote: 130, attribution: 40, stat: 3, 'stat-label': 60, card: 90, 'card-top': 26, 'card-bottom': 26, pills: 32, bench: 60, url: 24 };

/** The reel's words as layers, for the check that they are whole and nobody else's. */
export function reelLayers(copy: Partial<ReelCopy>, asked: Record<string, string>): DrawnLayer[] {
	const c = videoDoc().reel.colors;
	return reelCopySlots().filter((s) => asked[s.id]?.trim()).map((s) => {
		const words = [copy[s.key]].flat().join('\n').replace(/\*/g, '');
		return { id: s.id, kind: 'text' as const, box: { x: 0, y: 0, w: 1, h: 1 }, text: { asked: asked[s.id]!.replace(/\*/g, ''), drawn: words, size: 40, color: tokenColor(c.black!), ground: [tokenColor(c.white!)] }, can: {} };
	});
}


/** The reel's page: tokens and copy first, then the bundle (build/assets/reel.js), with the faces embedded. */
export function reelHtml(copy: Partial<ReelCopy> = {}): string {
	const d = videoDoc().reel;
	const js = pkgPath('build', 'assets', 'reel.js');
	if (!existsSync(js)) throw new Error('build/assets/reel.js is missing: run the build first.');
	const colors = Object.fromEntries(Object.entries(d.colors).map(([k, v]) => [k, tokenColor(v)]));
	const face = (w: number) => `@font-face{font-family:"Rethink Sans";font-weight:${w};src:url(data:font/ttf;base64,${readFileSync(pkgPath('brand', 'fonts', `rethink-sans-${w}.ttf`)).toString('base64')})}`;
	const reel = { colors, copy: { ...d.copy, ...copy } };
	return `<!doctype html><html><head><meta charset="utf-8"><style>${face(400)}${face(500)}:root{--cx-ground:${colors.ground}}${readFileSync(pkgPath('build', 'assets', 'reel.css'), 'utf8')}</style></head><body><div id="cx-stage"></div><script>window.__reel=${JSON.stringify(reel).replace(/</g, '\\u003c')}</script><script>${readFileSync(js, 'utf8')}</script></body></html>`;
}

/** Draws the reel's frames in headless Chromium and hands each PNG to `each`. `times` picks frames (seconds). */
export async function reelFrames(copy: Partial<ReelCopy>, fps: number, each: (png: Buffer, index: number) => Promise<void> | void, times?: number[]) {
	const d = videoDoc().reel;
	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width: d.width, height: d.height }, deviceScaleFactor: 1 });
		await page.setContent(reelHtml(copy), { waitUntil: 'load' });
		await page.waitForFunction(() => (window as unknown as { __reelReady?: boolean }).__reelReady === true);
		const stage = page.locator('#cx-stage');
		const list = times ?? Array.from({ length: Math.round(d.seconds * fps) }, (_, i) => i / fps);
		for (const [i, t] of list.entries()) {
			await page.evaluate((at) => (window as unknown as { __seek: (t: number) => Promise<void> }).__seek(at), t);
			await each(await stage.screenshot({ type: 'png', animations: 'disabled' }), i);
		}
	} finally {
		await browser.close();
	}
}

/** Writes PNG frames into a folder (the fallback without ffmpeg). */
export function writeFrame(dir: string, index: number, png: Buffer) {
	const path = join(dir, `frame-${String(index).padStart(5, '0')}.png`);
	write(path, png);
	return path;
}
