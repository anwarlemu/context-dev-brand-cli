import { Path2D } from '@napi-rs/canvas';
import type { Ctx } from './canvas.js';
import type { Picture } from './picture.js';
import { grid, hexLightness, shade, type Grid, type Rect, type ShaderOpts } from './shader.js';

// The dot field as a building block, for anything that is not one of the editor's templates (deck slides, merch,
// video frames, illustrations): a grid of whole dots across a frame, any picture shaded into it by the dot shader as
// filled dots and rings, the rest of the grid as a faint field or rings, and no dot under the words. The same rules as
// the share images (src/assets/og.ts); `RING` is their ring width.

export { grid, shade, type Grid, type Rect, type ShaderOpts };
export { dotIcon, dotText } from './og.js';

export const RING = 1.2;

export type FieldColors = { bg: string; fill: string; ring: string; field: string; fieldOp: number };

export type DotFieldOptions = {
	/** The frame the grid spans (its own pixels). */
	width: number;
	height: number;
	dot: number;
	gap: number;
	colors: FieldColors;
	/** The grid behind the picture: none, faint (filled dots at fieldOp) or rings. */
	field?: 'none' | 'faint' | 'rings';
	/** A picture shaded into the grid, placed at `rect` (default: fitted and centered in the frame). */
	picture?: Picture | null;
	rect?: Rect;
	shader?: Partial<ShaderOpts>;
	/** Boxes no dot may touch (words, the logo), with `pad` around them. */
	keep?: Rect[];
	pad?: number;
	/** 0 to 1 per dot center: below 0.5 the dot is left out; in between, faint dots fade (field only). */
	mask?: (x: number, y: number) => number;
	/** Only dots fully inside this box are drawn. */
	clip?: Rect;
	/** Scales each dot's radius by its position (for motion); 1 keeps the size. */
	size?: (x: number, y: number) => number;
};

export const SHADER_DEFAULTS: Omit<ShaderOpts, 'dot' | 'gap' | 'dotsLight'> = { render: 'toneEdges', fillPct: 40, hollowPct: 40, localContrast: 3, edgeAmt: 0, dither: 'none', invert: false, cutout: 'auto', keyTol: 2 };

/** A picture fitted inside a box at `scale` percent and centered on (cx, cy), shares of the box. */
export function placePicture(pic: Picture, box: Rect, scale = 100, cx = 0.5, cy = 0.5): Rect {
	const sc = (Math.min(box.w / pic.width, box.h / pic.height) * scale) / 100;
	const w = pic.width * sc;
	const h = pic.height * sc;
	return { x: box.x + cx * box.w - w / 2, y: box.y + cy * box.h - h / 2, w, h };
}

/** Draws the field and returns the grid it used. */
export function drawDotField(ctx: Ctx, o: DotFieldOptions): Grid {
	const g = grid(o.width, o.height, o.dot, o.gap);
	const c = o.colors;
	const st = o.picture
		? shade(o.picture, g, o.rect ?? placePicture(o.picture, { x: 0, y: 0, w: o.width, h: o.height }), {
				dot: o.dot,
				gap: o.gap,
				...SHADER_DEFAULTS,
				...o.shader,
				dotsLight: hexLightness(c.fill.slice(0, 7)) > hexLightness(c.bg.slice(0, 7)),
			})
		: new Uint8Array(g.cols * g.rows);
	const rad = o.dot / 2;
	const ringR = Math.max(0.1, rad - RING / 2);
	const pad = o.pad ?? 12;
	const keep = o.keep ?? [];
	const field = o.field ?? 'none';
	const covered = (x: number, y: number, r: number) => keep.some((b) => x + r > b.x - pad && x - r < b.x + b.w + pad && y + r > b.y - pad && y - r < b.y + b.h + pad);
	const filled = new Path2D();
	const hollow = new Path2D();
	const faint = new Path2D();
	for (let r = 0; r < g.rows; r++)
		for (let q = 0; q < g.cols; q++) {
			const v = st[r * g.cols + q];
			if (v === 3) continue;
			const x = g.ox + (q + 0.5) * g.pitch;
			const y = g.oy + (r + 0.5) * g.pitch;
			if (o.clip && (x - rad < o.clip.x || x + rad > o.clip.x + o.clip.w || y - rad < o.clip.y || y + rad > o.clip.y + o.clip.h)) continue;
			if (covered(x, y, rad)) continue;
			if (o.mask && o.mask(x, y) < 0.5) continue;
			const k = o.size ? Math.max(0, o.size(x, y)) : 1;
			if (k <= 0.02) continue;
			if (v === 2) {
				filled.moveTo(x + rad * k, y);
				filled.arc(x, y, rad * k, 0, Math.PI * 2);
			} else if (v === 1 && field !== 'faint') {
				hollow.moveTo(x + ringR * k, y);
				hollow.arc(x, y, ringR * k, 0, Math.PI * 2);
			} else if (field !== 'none') {
				const fr = (field === 'rings' ? ringR : rad) * k;
				faint.moveTo(x + fr, y);
				faint.arc(x, y, fr, 0, Math.PI * 2);
			}
		}
	ctx.save();
	ctx.globalAlpha = c.fieldOp;
	if (field === 'rings') {
		ctx.strokeStyle = c.field;
		ctx.lineWidth = RING;
		ctx.stroke(faint);
	} else {
		ctx.fillStyle = c.field;
		ctx.fill(faint);
	}
	ctx.globalAlpha = 1;
	ctx.strokeStyle = c.ring;
	ctx.lineWidth = RING;
	ctx.stroke(hollow);
	ctx.fillStyle = c.fill;
	ctx.fill(filled);
	ctx.restore();
	return g;
}

/** The burst (the customer story's): rays of dots spreading from (cx, cy), rings near it and up top, solid dots further
 * out and lower down, like light catching a sphere. `R` is its size. */
export function drawBurst(ctx: Ctx, o: { width: number; height: number; cx: number; cy: number; R: number; fill: string; ring: string; keep?: Rect[]; pad?: number; grow?: number }) {
	const rays = 44;
	const step = (Math.PI * 2) / rays;
	const far = o.R * 0.78 * (o.grow ?? 1);
	const pad = o.pad ?? 16;
	const keep = o.keep ?? [];
	const covered = (x: number, y: number, r: number) => keep.some((b) => x + r > b.x - pad && x - r < b.x + b.w + pad && y + r > b.y - pad && y - r < b.y + b.h + pad);
	const filled = new Path2D();
	const hollow = new Path2D();
	let ring = 0;
	for (let r = o.R * 0.12; r < far; r *= 1.14, ring++) {
		const off = ring % 2 ? step / 2 : 0;
		for (let i = 0; i < rays; i++) {
			const a = i * step + off;
			const x = o.cx + Math.cos(a) * r;
			const y = o.cy + Math.sin(a) * r;
			const lit = (1 + Math.sin(a)) / 2;
			const grow = Math.min(1, r / (o.R * 0.7));
			const rad = Math.min(r * step * 0.4, o.R * 0.036) * (0.35 + 0.65 * lit) * (0.45 + 0.55 * grow);
			if (rad < 1.2) continue;
			if (x + rad < 0 || x - rad > o.width || y + rad < 0 || y - rad > o.height) continue;
			if (covered(x, y, rad)) continue;
			if (lit < 0.3 || grow < 0.35) {
				const rr = Math.max(0.5, rad - RING);
				hollow.moveTo(x + rr, y);
				hollow.arc(x, y, rr, 0, Math.PI * 2);
			} else {
				filled.moveTo(x + rad, y);
				filled.arc(x, y, rad, 0, Math.PI * 2);
			}
		}
	}
	ctx.save();
	ctx.strokeStyle = o.ring;
	ctx.lineWidth = RING * 1.6;
	ctx.stroke(hollow);
	ctx.fillStyle = o.fill;
	ctx.fill(filled);
	ctx.restore();
}
