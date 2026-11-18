import type { Pixels } from './png.js';

// A small software canvas, enough for the shader and the built-in subjects: filled paths (lines, arcs, ellipses,
// rectangles; nonzero or even-odd), stroked paths, solid and gradient paints, image resampling and a gaussian blur.
// Pure and deterministic: the same drawing gives the same bytes on every machine.

export type Stop = [offset: number, color: string];
export type Paint = string | { linear: [x0: number, y0: number, x1: number, y1: number]; stops: Stop[] } | { radial: [x0: number, y0: number, r0: number, x1: number, y1: number, r1: number]; stops: Stop[] };
/** Path commands: M x y, L x y, Z, arc cx cy r a0 a1 (radians, clockwise like canvas), ellipse cx cy rx ry, rect x y w h. */
export type Cmd = ['M', number, number] | ['L', number, number] | ['Z'] | ['arc', number, number, number, number, number] | ['ellipse', number, number, number, number] | ['rect', number, number, number, number];
export type Op = { fill?: Paint; stroke?: Paint; width?: number; rule?: 'nonzero' | 'evenodd'; path: Cmd[] };

type Pt = [number, number];
type Poly = { pts: Pt[]; closed: boolean };

export function hexRgb(hex: string): [number, number, number, number] {
	const h = hex.replace('#', '');
	const full = h.length === 3 || h.length === 4 ? [...h].map((c) => c + c).join('') : h;
	const n = Number.parseInt(full.slice(0, 6), 16);
	const a = full.length === 8 ? Number.parseInt(full.slice(6, 8), 16) / 255 : 1;
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}

/** A canvas arc or ellipse as points, fine enough that no facet shows at the sizes subjects are drawn. */
function arcPoints(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Pt[] {
	let sweep = a1 - a0;
	if (sweep >= Math.PI * 2) sweep = Math.PI * 2;
	const steps = Math.max(8, Math.ceil((Math.abs(sweep) * Math.max(rx, ry)) / 2));
	const out: Pt[] = [];
	for (let i = 0; i <= steps; i++) {
		const a = a0 + (sweep * i) / steps;
		out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
	}
	return out;
}

/** Flattens a path into polylines; a canvas arc continues the current subpath with a line to its start. */
export function flatten(path: Cmd[]): Poly[] {
	const polys: Poly[] = [];
	let cur: Pt[] = [];
	const end = (closed: boolean) => {
		if (cur.length > 1) polys.push({ pts: cur, closed });
		cur = [];
	};
	for (const c of path) {
		if (c[0] === 'M') {
			end(false);
			cur.push([c[1], c[2]]);
		} else if (c[0] === 'L') cur.push([c[1], c[2]]);
		else if (c[0] === 'Z') end(true);
		else if (c[0] === 'arc') cur.push(...arcPoints(c[1], c[2], c[3], c[3], c[4], c[5]));
		else if (c[0] === 'ellipse') {
			end(false);
			cur = arcPoints(c[1], c[2], c[3], c[4], 0, Math.PI * 2);
			end(true);
		} else if (c[0] === 'rect') {
			end(false);
			const [, x, y, w, h] = c;
			cur = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
			end(true);
		}
	}
	end(false);
	return polys;
}

const SS = 4;

/** Coverage (0..1) of a filled polygon set over a W by H grid, 4 by 4 samples per pixel. */
export function fillCoverage(polys: Poly[], W: number, H: number, rule: 'nonzero' | 'evenodd' = 'nonzero'): Float32Array {
	const cov = new Float32Array(W * H);
	const edges: [number, number, number, number, number][] = [];
	let minY = Infinity;
	let maxY = -Infinity;
	for (const p of polys) {
		const pts = p.pts;
		for (let i = 0; i < pts.length; i++) {
			const a = pts[i]!;
			const b = pts[(i + 1) % pts.length]!;
			if (a[1] === b[1]) continue;
			const dir = a[1] < b[1] ? 1 : -1;
			const [lo, hi] = dir === 1 ? [a, b] : [b, a];
			edges.push([lo[0], lo[1], hi[0], hi[1], dir]);
			minY = Math.min(minY, lo[1]);
			maxY = Math.max(maxY, hi[1]);
		}
	}
	if (!edges.length) return cov;
	const y0 = Math.max(0, Math.floor(minY * SS));
	const y1 = Math.min(H * SS - 1, Math.ceil(maxY * SS));
	const xs: [number, number][] = [];
	const unit = 1 / (SS * SS);
	for (let sy = y0; sy <= y1; sy++) {
		const y = (sy + 0.5) / SS;
		xs.length = 0;
		for (const [ax, ay, bx, by, dir] of edges) {
			if (y < ay || y >= by) continue;
			xs.push([ax + ((y - ay) / (by - ay)) * (bx - ax), dir]);
		}
		if (xs.length < 2) continue;
		xs.sort((a, b) => a[0] - b[0]);
		const row = Math.floor(sy / SS) * W;
		let wind = 0;
		for (let i = 0; i < xs.length - 1; i++) {
			wind += xs[i]![1];
			const inside = rule === 'evenodd' ? (i + 1) % 2 === 1 : wind !== 0;
			if (!inside) continue;
			const s0 = Math.max(0, Math.ceil(xs[i]![0] * SS - 0.5));
			const s1 = Math.min(W * SS - 1, Math.ceil(xs[i + 1]![0] * SS - 0.5) - 1);
			for (let sx = s0; sx <= s1; sx++) cov[row + (sx >> 2)] += unit;
		}
	}
	return cov;
}

/** Coverage of a stroke: everything within width/2 of the path (butt ends on open paths, round joins). */
export function strokeCoverage(polys: Poly[], W: number, H: number, width: number): Float32Array {
	// One bit per sample (4 by 4 per pixel), so overlapping segments make a union, then a popcount.
	const masks = new Uint16Array(W * H);
	const hw = width / 2;
	const hw2 = hw * hw;
	for (const p of polys) {
		const pts = p.closed ? [...p.pts, p.pts[0]!] : p.pts;
		const n = pts.length - 1;
		for (let i = 0; i < n; i++) {
			const [ax, ay] = pts[i]!;
			const [bx, by] = pts[i + 1]!;
			const dx = bx - ax;
			const dy = by - ay;
			const len2 = dx * dx + dy * dy || 1e-9;
			const buttStart = !p.closed && i === 0;
			const buttEnd = !p.closed && i === n - 1;
			const X0 = Math.max(0, Math.floor(Math.min(ax, bx) - hw));
			const X1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx) + hw));
			const Y0 = Math.max(0, Math.floor(Math.min(ay, by) - hw));
			const Y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by) + hw));
			for (let Y = Y0; Y <= Y1; Y++) for (let X = X0; X <= X1; X++) {
				let m = masks[Y * W + X]!;
				if (m === 0xffff) continue;
				for (let s = 0; s < SS * SS; s++) {
					if (m & (1 << s)) continue;
					const px = X + ((s & 3) + 0.5) / SS;
					const py = Y + ((s >> 2) + 0.5) / SS;
					let t = ((px - ax) * dx + (py - ay) * dy) / len2;
					if ((buttStart && t < 0) || (buttEnd && t > 1)) continue;
					t = t < 0 ? 0 : t > 1 ? 1 : t;
					const qx = ax + t * dx - px;
					const qy = ay + t * dy - py;
					if (qx * qx + qy * qy <= hw2) m |= 1 << s;
				}
				masks[Y * W + X] = m;
			}
		}
	}
	const cov = new Float32Array(W * H);
	for (let i = 0; i < W * H; i++) {
		let m = masks[i]!;
		if (!m) continue;
		let c = 0;
		while (m) {
			m &= m - 1;
			c++;
		}
		cov[i] = c / (SS * SS);
	}
	return cov;
}

function stopColor(stops: Stop[], t: number): [number, number, number, number] {
	const s = [...stops].sort((a, b) => a[0] - b[0]);
	if (t <= s[0]![0]) return hexRgb(s[0]![1]);
	for (let i = 0; i < s.length - 1; i++) {
		const [o0, c0] = s[i]!;
		const [o1, c1] = s[i + 1]!;
		if (t <= o1) {
			const k = o1 === o0 ? 1 : (t - o0) / (o1 - o0);
			const a = hexRgb(c0);
			const b = hexRgb(c1);
			return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k];
		}
	}
	return hexRgb(s[s.length - 1]![1]);
}

/** A paint's color at a point; gradients follow the canvas spec (pad; radial is two-point conical). */
export function paintAt(paint: Paint, x: number, y: number): [number, number, number, number] | null {
	if (typeof paint === 'string') return hexRgb(paint);
	if ('linear' in paint) {
		const [x0, y0, x1, y1] = paint.linear;
		const dx = x1 - x0;
		const dy = y1 - y0;
		const t = ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1e-9);
		return stopColor(paint.stops, Math.max(0, Math.min(1, t)));
	}
	const [x0, y0, r0, x1, y1, r1] = paint.radial;
	const cdx = x1 - x0, cdy = y1 - y0, dr = r1 - r0;
	const pdx = x - x0, pdy = y - y0;
	const a = cdx * cdx + cdy * cdy - dr * dr;
	const b = pdx * cdx + pdy * cdy + r0 * dr;
	const c = pdx * pdx + pdy * pdy - r0 * r0;
	let t: number;
	if (Math.abs(a) < 1e-9) {
		if (Math.abs(b) < 1e-9) return null;
		t = c / (2 * b);
	} else {
		const disc = b * b - a * c;
		if (disc < 0) return null;
		const sq = Math.sqrt(disc);
		const ta = (b + sq) / a;
		const tb = (b - sq) / a;
		const ok = (v: number) => r0 + v * dr >= 0;
		t = ok(Math.max(ta, tb)) ? Math.max(ta, tb) : ok(Math.min(ta, tb)) ? Math.min(ta, tb) : Number.NaN;
		if (Number.isNaN(t)) return null;
	}
	return stopColor(paint.stops, Math.max(0, Math.min(1, t)));
}

/** A transparent canvas in premultiplied floats, painted source-over. */
export class Canvas {
	readonly px: Float32Array;
	constructor(readonly width: number, readonly height: number) {
		this.px = new Float32Array(width * height * 4);
	}

	private composite(cov: Float32Array, paint: Paint) {
		const { width: W, px } = this;
		for (let i = 0; i < cov.length; i++) {
			const k = Math.min(1, cov[i]!);
			if (k <= 0) continue;
			const c = paintAt(paint, (i % W) + 0.5, Math.floor(i / W) + 0.5);
			if (!c) continue;
			const a = c[3] * k;
			const o = i * 4;
			px[o] = (c[0] / 255) * a + px[o]! * (1 - a);
			px[o + 1] = (c[1] / 255) * a + px[o + 1]! * (1 - a);
			px[o + 2] = (c[2] / 255) * a + px[o + 2]! * (1 - a);
			px[o + 3] = a + px[o + 3]! * (1 - a);
		}
	}

	draw(op: Op) {
		const polys = flatten(op.path);
		if (op.fill) this.composite(fillCoverage(polys.map((p) => ({ ...p, closed: true })), this.width, this.height, op.rule), op.fill);
		if (op.stroke) this.composite(strokeCoverage(polys, this.width, this.height, op.width ?? 1), op.stroke);
	}

	pixels(): Pixels {
		const data = new Uint8ClampedArray(this.width * this.height * 4);
		for (let i = 0; i < this.width * this.height; i++) {
			const a = this.px[i * 4 + 3]!;
			data[i * 4 + 3] = Math.round(a * 255);
			if (a > 0) for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.round((this.px[i * 4 + c]! / a) * 255);
		}
		return { width: this.width, height: this.height, data };
	}
}

/** Premultiplied float copy of straight RGBA pixels. */
function premultiplied(src: Pixels): Float32Array {
	const out = new Float32Array(src.width * src.height * 4);
	for (let i = 0; i < src.width * src.height; i++) {
		const a = src.data[i * 4 + 3]! / 255;
		out[i * 4] = (src.data[i * 4]! / 255) * a;
		out[i * 4 + 1] = (src.data[i * 4 + 1]! / 255) * a;
		out[i * 4 + 2] = (src.data[i * 4 + 2]! / 255) * a;
		out[i * 4 + 3] = a;
	}
	return out;
}

function straight(px: Float32Array, width: number, height: number): Pixels {
	const data = new Uint8ClampedArray(width * height * 4);
	for (let i = 0; i < width * height; i++) {
		const a = px[i * 4 + 3]!;
		data[i * 4 + 3] = Math.round(a * 255);
		if (a > 1e-6) for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.round(Math.min(1, px[i * 4 + c]! / a) * 255);
	}
	return { width, height, data };
}

/**
 * Draws `src` into a new W by H transparent image so that it fills the rectangle (dx, dy, dw, dh), like canvas
 * drawImage: an area average when shrinking, bilinear when enlarging, partly covered edge pixels antialiased.
 */
export function drawImage(src: Pixels, W: number, H: number, dx: number, dy: number, dw: number, dh: number): Pixels {
	const s = premultiplied(src);
	const out = new Float32Array(W * H * 4);
	const sx = src.width / dw;
	const sy = src.height / dh;
	const axis = (o: number, d: number, scale: number, size: number, n: number) => {
		// Per destination column (or row): weighted source taps and the share of the pixel inside the rectangle.
		const taps: { idx: number[]; w: number[]; cover: number }[] = [];
		for (let X = 0; X < n; X++) {
			const cover = Math.max(0, Math.min(X + 1, o + d) - Math.max(X, o));
			const idx: number[] = [];
			const w: number[] = [];
			if (cover > 0) {
				const u = (X + 0.5 - o) * scale;
				if (scale > 1) {
					const a = u - scale / 2;
					const b = u + scale / 2;
					for (let i = Math.floor(a); i < Math.ceil(b); i++) {
						const wt = Math.min(b, i + 1) - Math.max(a, i);
						if (wt <= 0) continue;
						idx.push(Math.max(0, Math.min(size - 1, i)));
						w.push(wt / scale);
					}
				} else {
					const f = u - 0.5;
					const i0 = Math.floor(f);
					const t = f - i0;
					idx.push(Math.max(0, Math.min(size - 1, i0)), Math.max(0, Math.min(size - 1, i0 + 1)));
					w.push(1 - t, t);
				}
			}
			taps.push({ idx, w, cover });
		}
		return taps;
	};
	const cols = axis(dx, dw, sx, src.width, W);
	const rows = axis(dy, dh, sy, src.height, H);
	for (let Y = 0; Y < H; Y++) {
		const r = rows[Y]!;
		if (!r.cover) continue;
		for (let X = 0; X < W; X++) {
			const c = cols[X]!;
			if (!c.cover) continue;
			let R = 0, G = 0, B = 0, A = 0;
			for (let j = 0; j < r.idx.length; j++) {
				const rowBase = r.idx[j]! * src.width;
				const wy = r.w[j]!;
				for (let i = 0; i < c.idx.length; i++) {
					const o = (rowBase + c.idx[i]!) * 4;
					const wt = wy * c.w[i]!;
					R += s[o]! * wt; G += s[o + 1]! * wt; B += s[o + 2]! * wt; A += s[o + 3]! * wt;
				}
			}
			const k = Math.min(1, r.cover) * Math.min(1, c.cover);
			const o = (Y * W + X) * 4;
			out[o] = R * k; out[o + 1] = G * k; out[o + 2] = B * k; out[o + 3] = A * k;
		}
	}
	return straight(out, W, H);
}

/** A gaussian blur of the alpha channel (CSS blur(σ px)), as a separate mask. */
export function blurAlpha(src: Pixels, sigma: number): Float32Array {
	const { width: W, height: H } = src;
	const r = Math.ceil(sigma * 3);
	const k: number[] = [];
	let sum = 0;
	for (let i = -r; i <= r; i++) {
		const v = Math.exp(-(i * i) / (2 * sigma * sigma));
		k.push(v);
		sum += v;
	}
	const kn = k.map((v) => v / sum);
	const a = new Float32Array(W * H);
	for (let i = 0; i < W * H; i++) a[i] = src.data[i * 4 + 3]! / 255;
	const tmp = new Float32Array(W * H);
	for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
		let v = 0;
		for (let i = -r; i <= r; i++) {
			const X = x + i;
			if (X >= 0 && X < W) v += a[y * W + X]! * kn[i + r]!;
		}
		tmp[y * W + x] = v;
	}
	const out = new Float32Array(W * H);
	for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
		let v = 0;
		for (let i = -r; i <= r; i++) {
			const Y = y + i;
			if (Y >= 0 && Y < H) v += tmp[Y * W + x]! * kn[i + r]!;
		}
		out[y * W + x] = v;
	}
	return out;
}
