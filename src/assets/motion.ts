import { loadImage } from '@napi-rs/canvas';
import { brandFonts, pixelsOf, surface, toPng, tokenColor, type Ctx } from './canvas.js';
import { drawLogo, drawMark, logoRatio, markRatio } from './logo.js';
import { bodyFace, chipFace, drawBlock, headFace, paletteOf, setBlock } from './og.js';
import type { Picture } from './picture.js';

// Brand motion for any graphic: a reveal of a finished design through the brand's dot grid, intro and outro stings
// with the logo's own pop, a lower third, and a walkthrough of screenshots in the site's window. Explanatory motion,
// so longer than UI motion, on the reel's curves (brand/assets/reel/motion.ts): ease-out to enter, a stronger ease-out
// to leave sooner than it came, ease-in-out to move on screen, the logo's overshoot only on the mark. Nothing eases in.
// Every frame is a pure function of its time, so the same inputs give the same frames; the last frame of a loop meets
// the first. For reduced motion, the still (--still) is the finished frame.

export const easeOut = (t: number) => 1 - (1 - t) ** 3;
/** The strong ease-out (cubic-bezier(0.23, 1, 0.32, 1)), close enough as a power curve, for exits. */
export const easeOutStrong = (t: number) => 1 - (1 - t) ** 5;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

export type MotionKind = 'reveal' | 'intro' | 'outro' | 'lower-third' | 'walkthrough';
export const MOTION_KINDS: { id: MotionKind; description: string }[] = [
	{ id: 'reveal', description: 'Any design file revealed through the dot grid, held, and closed again, as a seamless loop (a stat card here is the animated stat).' },
	{ id: 'intro', description: 'An intro sting: the mark pops into its bite, the wordmark follows, a line under it.' },
	{ id: 'outro', description: 'An outro sting: the logo, a line and the address, settling in and holding.' },
	{ id: 'lower-third', description: 'A name and role on a bar that slides in from the left and out again faster, on a transparent ground (PNG frames or WebM with alpha).' },
	{ id: 'walkthrough', description: 'Screenshots in the site\'s window, one after another with a caption each.' },
];

export type Frame = { rgba: Buffer; png: () => Buffer };

function frameOf(s: ReturnType<typeof surface>): Frame {
	return { rgba: pixelsOf(s).data, png: () => toPng(s) };
}

/** A design's finished picture revealed through dots: each cell of the grid opens as a growing circle, left to right
 * with a little noise, holds, then closes faster than it opened. `seconds` long. */
export async function* revealFrames(png: Buffer, o: { seconds: number; fps: number; ground: string }): AsyncGenerator<Frame> {
	const img = await loadImage(png);
	const W = img.width;
	const H = img.height;
	const pitch = Math.max(12, Math.round(Math.min(W, H) / 40));
	const cols = Math.ceil(W / pitch);
	const rows = Math.ceil(H / pitch);
	const n = Math.round(o.seconds * o.fps);
	// Open over 1.2 s, hold, close over 0.6 s at the end; the empty ground on both ends meets.
	const open = 1.2;
	const close = 0.6;
	for (let i = 0; i < n; i++) {
		const t = i / o.fps;
		const s = surface(W, H);
		s.ctx.fillStyle = o.ground;
		s.ctx.fillRect(0, 0, W, H);
		s.ctx.save();
		s.ctx.beginPath();
		const shut = span(t, o.seconds - close, o.seconds);
		for (let r = 0; r < rows; r++)
			for (let c = 0; c < cols; c++) {
				const jitter = ((Math.imul(c * 73856093 ^ r * 19349663, 2654435761) >>> 0) / 4294967296) * 0.25;
				const start = (c / cols) * (open - 0.45) + jitter * 0.3;
				const k = easeOut(span(t, start, start + 0.45)) * (1 - easeOutStrong(shut));
				if (k <= 0) continue;
				const rad = (pitch * 0.75) * k;
				const x = c * pitch + pitch / 2;
				const y = r * pitch + pitch / 2;
				s.ctx.moveTo(x + rad, y);
				s.ctx.arc(x, y, rad, 0, Math.PI * 2);
			}
		s.ctx.clip();
		s.ctx.drawImage(img, 0, 0, W, H);
		s.ctx.restore();
		yield frameOf(s);
	}
}

/** The intro: the mark's circle pops from the square's bite to its place (the site logo's hover, with its overshoot),
 * then the wordmark and the line come up and hold. */
export function* introFrames(o: { width: number; height: number; seconds: number; fps: number; palette?: string; headline?: string }): Generator<Frame> {
	const p = paletteOf({ palette: o.palette ?? 'Blue' });
	const fonts = brandFonts();
	const { width: W, height: H } = o;
	const k = Math.min(W, H) / 1080;
	const lh = 120 * k;
	const lw = logoRatio() * lh;
	const mw = markRatio() * lh;
	const n = Math.round(o.seconds * o.fps);
	for (let i = 0; i < n; i++) {
		const t = i / o.fps;
		const s = surface(W, H);
		const ctx = s.ctx;
		ctx.fillStyle = p.bg;
		ctx.fillRect(0, 0, W, H);
		const x0 = (W - lw) / 2;
		const y0 = (H - lh) / 2 - (o.headline ? 40 * k : 0);
		// 0 to 0.5 s the mark scales up from 0.9 and fades in; 0.5 to 1.1 s the circle pops out of its bite.
		const show = easeOut(span(t, 0, 0.5));
		const pop = span(t, 0.5, 1.1);
		const back = (v: number) => {
			const c1 = 2.2;
			return 1 + (c1 + 1) * (v - 1) ** 3 + c1 * (v - 1) ** 2;
		};
		ctx.save();
		ctx.globalAlpha = show;
		const sc = 0.9 + 0.1 * show;
		ctx.translate(x0 + mw / 2, y0 + lh / 2);
		ctx.scale(sc, sc);
		drawMark(ctx, -mw / 2, -lh / 2, lh, p.mark, pop <= 0 ? 0 : back(pop));
		ctx.restore();
		// 1.0 to 1.6 s the wordmark rises 12 px and fades in; the line follows 150 ms later.
		const word = easeOut(span(t, 1.0, 1.6));
		if (word > 0) {
			ctx.save();
			ctx.globalAlpha = word;
			ctx.beginPath();
			ctx.rect(x0 + mw * 1.02, 0, W, H);
			ctx.clip();
			drawLogo(ctx, x0, y0 + (1 - word) * 12 * k, lh, 'rgba(0,0,0,0)', p.ink);
			ctx.restore();
		}
		if (o.headline) {
			const line = easeOut(span(t, 1.15, 1.75));
			if (line > 0) {
				const b = setBlock(ctx, o.headline, headFace(fonts), 48 * k, W * 0.8);
				ctx.globalAlpha = line;
				drawBlock(ctx, b, 0, y0 + lh + 56 * k + (1 - line) * 12 * k, 'center', W, p.ink);
				ctx.globalAlpha = 1;
			}
		}
		yield frameOf(s);
	}
}

/** The outro: the logo, a line and the address come up together, hold, and stay (it ends a film). */
export function* outroFrames(o: { width: number; height: number; seconds: number; fps: number; palette?: string; headline?: string; url?: string }): Generator<Frame> {
	const p = paletteOf({ palette: o.palette ?? 'Blue' });
	const fonts = brandFonts();
	const { width: W, height: H } = o;
	const k = Math.min(W, H) / 1080;
	const lh = 96 * k;
	const lw = logoRatio() * lh;
	const n = Math.round(o.seconds * o.fps);
	for (let i = 0; i < n; i++) {
		const t = i / o.fps;
		const s = surface(W, H);
		const ctx = s.ctx;
		ctx.fillStyle = p.bg;
		ctx.fillRect(0, 0, W, H);
		const y0 = (H - lh) / 2 - (o.headline ? 50 * k : 0);
		// Each part rises 16 px into place and fades in over 0.6 s, the next 120 ms after the one before.
		const parts: [number, (dy: number) => void][] = [
			[0, (dy) => drawLogo(ctx, (W - lw) / 2, y0 + dy, lh, p.mark, p.ink)],
			...(o.headline ? [[0.12, (dy: number) => drawBlock(ctx, setBlock(ctx, o.headline!, headFace(fonts), 52 * k, W * 0.8), 0, y0 + lh + 48 * k + dy, 'center', W, p.ink)] as [number, (dy: number) => void]] : []),
			...(o.url ? [[0.24, (dy: number) => drawBlock(ctx, setBlock(ctx, o.url!, chipFace(fonts), 30 * k, W * 0.8), 0, H - 140 * k + dy, 'center', W, p.ink)] as [number, (dy: number) => void]] : []),
		];
		for (const [delay, draw] of parts) {
			const v = easeOut(span(t, delay, delay + 0.6));
			if (v <= 0) continue;
			ctx.globalAlpha = v;
			draw((1 - v) * 16 * k);
		}
		ctx.globalAlpha = 1;
		yield frameOf(s);
	}
}

/** The lower third: a bar in the palette's dots color slides in from the left (0.45 s), the name and role rise in on it,
 * it holds, and leaves faster (0.3 s) than it came. Transparent around it. */
export function* lowerThirdFrames(o: { width: number; height: number; seconds: number; fps: number; palette?: string; name: string; role?: string }): Generator<Frame> {
	const p = paletteOf({ palette: o.palette ?? 'Paper' });
	const fonts = brandFonts();
	const { width: W, height: H } = o;
	const k = W / 1920;
	const n = Math.round(o.seconds * o.fps);
	const ink = p.fill === p.bg ? p.ink : p.bg;
	const probe = surface(10, 10);
	const name = setBlock(probe.ctx, o.name, { ...headFace(fonts), leading: 1.1 }, 52 * k, W * 0.5);
	const role = o.role ? setBlock(probe.ctx, o.role, bodyFace(fonts), 30 * k, W * 0.5) : undefined;
	const padX = 40 * k;
	const bw = Math.max(name.w, role?.w ?? 0) + padX * 2;
	const bh = name.h + (role ? role.h + 6 * k : 0) + 44 * k;
	const x0 = 96 * k;
	const y0 = H - 140 * k - bh;
	for (let i = 0; i < n; i++) {
		const t = i / o.fps;
		const s = surface(W, H);
		const ctx = s.ctx;
		const leave = easeOutStrong(span(t, o.seconds - 0.3, o.seconds));
		const enter = easeOut(span(t, 0, 0.45));
		const shift = (1 - enter) * -(bw + x0) + leave * -(bw + x0);
		if (enter > 0 && leave < 1) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(0, 0, W, H);
			ctx.clip();
			ctx.translate(shift, 0);
			ctx.fillStyle = p.fill;
			ctx.beginPath();
			ctx.roundRect(x0, y0, bw, bh, 16 * k);
			ctx.fill();
			const words = easeOut(span(t, 0.2, 0.6)) * (1 - leave);
			ctx.globalAlpha = words;
			drawBlock(ctx, name, x0 + padX, y0 + 22 * k + (1 - words) * 8 * k, 'left', name.w, ink);
			if (role) drawBlock(ctx, role, x0 + padX, y0 + 22 * k + name.h + 6 * k + (1 - words) * 8 * k, 'left', role.w, ink);
			ctx.restore();
		}
		yield frameOf(s);
	}
}

/** Screenshots in the site's window, one after another: each holds, then moves up and out as the next comes up under
 * it (ease-in-out, 0.6 s), with its caption. Ends on the first again, so it loops. */
export function* walkthroughFrames(o: { width: number; height: number; fps: number; palette?: string; shots: { picture: Picture; caption?: string }[]; each: number }): Generator<Frame> {
	const p = paletteOf({ palette: o.palette ?? 'Mist' });
	const fonts = brandFonts();
	const { width: W, height: H } = o;
	const k = Math.min(W, H) / 1080;
	const n = Math.round(o.shots.length * o.each * o.fps);
	const move = 0.6;
	for (let i = 0; i < n; i++) {
		const t = i / o.fps;
		const s = surface(W, H);
		const ctx = s.ctx;
		ctx.fillStyle = p.bg;
		ctx.fillRect(0, 0, W, H);
		const at = Math.floor(t / o.each);
		const local = t - at * o.each;
		const m = easeInOut(span(local, o.each - move, o.each));
		const cur = o.shots[at % o.shots.length]!;
		const next = o.shots[(at + 1) % o.shots.length]!;
		const lh = 36 * k;
		drawLogo(ctx, 64 * k, 56 * k, lh, p.mark, p.ink);
		const area = { x: W * 0.1, y: 150 * k, w: W * 0.8, h: H - 330 * k };
		for (const [shot, dy, alpha, words] of [[cur, -m * 40 * k, 1 - m, 1 - span(m, 0, 0.5)], [next, (1 - m) * 40 * k, m, span(m, 0.5, 1)]] as const) {
			if (alpha <= 0.001) continue;
			ctx.globalAlpha = alpha;
			drawWindow(ctx, shot.picture, area, dy, k);
			// Captions hand over one after the other, never two at once.
			if (shot.caption && words > 0.001) {
				ctx.globalAlpha = words;
				drawBlock(ctx, setBlock(ctx, shot.caption, headFace(fonts), 44 * k, W * 0.8), 0, H - 150 * k + dy, 'center', W, p.text);
			}
		}
		ctx.globalAlpha = 1;
		yield frameOf(s);
	}
}

/** A picture in the site's code window: the ring, the dark bar with its three dots, the picture whole. */
function drawWindow(ctx: Ctx, pic: Picture, area: { x: number; y: number; w: number; h: number }, dy: number, k: number) {
	const ring = 8 * k;
	const bar = 32 * k;
	const sc = Math.min((area.w - ring * 2) / pic.width, (area.h - ring * 2 - bar) / pic.height);
	const pw = pic.width * sc;
	const ph = pic.height * sc;
	const x = area.x + (area.w - pw - ring * 2) / 2;
	const y = area.y + (area.h - ph - bar - ring * 2) / 2 + dy;
	const tok = tokenColor;
	ctx.fillStyle = tok('ring-tint');
	ctx.beginPath();
	ctx.roundRect(x, y, pw + ring * 2, ph + bar + ring * 2, 22 * k);
	ctx.fill();
	ctx.save();
	ctx.beginPath();
	ctx.roundRect(x + ring, y + ring, pw, ph + bar, 14 * k);
	ctx.clip();
	ctx.fillStyle = tok('bg-code');
	ctx.fillRect(x + ring, y + ring, pw, bar);
	['window-close', 'window-minimize', 'window-zoom'].forEach((name, i) => {
		ctx.fillStyle = tok(name);
		ctx.beginPath();
		ctx.arc(x + ring + 18 * k + i * 20 * k, y + ring + bar / 2, 6 * k, 0, Math.PI * 2);
		ctx.fill();
	});
	ctx.drawImage(pic.canvas, x + ring, y + ring + bar, pw, ph);
	ctx.restore();
}
