import type { Pixels } from './png.js';
import { blurAlpha, drawImage } from './raster.js';

/*
 * The dot shader, ported from the share-image playground (public/context-image-shader/shader.js and
 * src/components/context-og/shader.ts) to run on plain RGBA pixels: cut the subject out of its background, sample
 * light, coverage and edges per dot, rank-equalize inside the subject, then three states per dot (filled, hollow,
 * empty). Every dot keeps one size; the picture is carried only by which dots are filled or hollow. The browser's
 * canvas resampling and blur are replaced by raster.ts, so results match the playground closely, not bit for bit.
 * The module is self-contained (no brand values, no file access) so it can be shared by other commands.
 */

export type Render = 'toneEdges' | 'tone' | 'edges' | 'silhouette';
export type Dither = 'none' | 'diffuse' | 'pattern';

export type ShaderOpts = {
	render: Render;
	fillPct: number;
	hollowPct: number;
	localContrast: number;
	edgeAmt: number;
	dither: Dither;
	invert: boolean;
	cutout: 'auto' | 'whole';
	keyTol: number;
	/** Whether filled dots stand for light (they are lighter than the ground). */
	dotsLight: boolean;
	/** Breaks ties between equal dots; 0 is the playground's own order. */
	seed?: number;
};

export type Grid = { cols: number; rows: number; pitch: number; ox: number; oy: number };
export type Rect = { x: number; y: number; w: number; h: number };

/** 0 field, 1 hollow, 2 filled, 3 empty inside the subject. */
export type States = Uint8Array;
export const FIELD = 0;
export const HOLLOW = 1;
export const FILLED = 2;
export const EMPTY = 3;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const toLin = (c: number) => {
	c /= 255;
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const LIN = new Float32Array(256).map((_, i) => toLin(i));
const lightness = (r: number, g: number, b: number) => Math.cbrt(0.2126 * LIN[r]! + 0.7152 * LIN[g]! + 0.0722 * LIN[b]!);
function oklab(r: number, g: number, b: number): [number, number, number] {
	const R = LIN[r]!, G = LIN[g]!, B = LIN[b]!;
	const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
	const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
	const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
	return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
export const hexLightness = (h: string) => {
	const n = Number.parseInt(h.slice(1, 7), 16);
	return lightness((n >> 16) & 255, (n >> 8) & 255, n & 255);
};

export type Cut = { pixels: Pixels; info: 'whole' | 'transparent' | 'removed' | 'no-background' };

/*
 * Cut-out. Transparent images keep their alpha. Otherwise the border colors are clustered (k-means in OKLab) and a
 * fill grows inward from the border through anything close to them; whatever it cannot reach is the subject.
 */
export function cutout(img: Pixels, mode: 'auto' | 'whole', keyTol: number): Cut {
	const sc = Math.min(1, 900 / Math.max(img.width, img.height));
	const w = Math.max(2, Math.round(img.width * sc));
	const h = Math.max(2, Math.round(img.height * sc));
	const base = sc === 1 ? { width: w, height: h, data: new Uint8ClampedArray(img.data) } : drawImage(img, w, h, 0, 0, w, h);
	const d = base.data;
	const N = w * h;
	// The model is the top and sides: subjects usually enter from the bottom, so it must not learn their color.
	const border: number[] = [];
	const model: number[] = [];
	for (let i = 0; i < w; i++) {
		border.push(i, (h - 1) * w + i);
		model.push(i);
	}
	for (let j = 1; j < h - 1; j++) {
		border.push(j * w, j * w + w - 1);
		model.push(j * w, j * w + w - 1);
	}
	const transparentBorder = border.filter((p) => d[p * 4 + 3]! < 200).length / border.length;
	if (mode === 'whole') return { pixels: base, info: 'whole' };
	if (transparentBorder > 0.25) return { pixels: base, info: 'transparent' };
	const lab = new Float32Array(N * 3);
	for (let p = 0; p < N; p++) {
		const o = oklab(d[p * 4]!, d[p * 4 + 1]!, d[p * 4 + 2]!);
		lab[p * 3] = o[0];
		lab[p * 3 + 1] = o[1];
		lab[p * 3 + 2] = o[2];
	}
	const K = 4;
	const cen: number[][] = [];
	for (let k = 0; k < K; k++) {
		const p = model[Math.floor(((k + 0.5) / K) * model.length)]!;
		cen.push([lab[p * 3]!, lab[p * 3 + 1]!, lab[p * 3 + 2]!]);
	}
	const dist = (p: number, c: number[]) => Math.hypot(lab[p * 3]! - c[0]!, (lab[p * 3 + 1]! - c[1]!) * 1.4, (lab[p * 3 + 2]! - c[2]!) * 1.4);
	const asg = new Int32Array(model.length);
	for (let it = 0; it < 10; it++) {
		const acc = cen.map(() => [0, 0, 0, 0]);
		model.forEach((p, i) => {
			let b = 0;
			let bd = 1e9;
			cen.forEach((c, k) => {
				const q = dist(p, c);
				if (q < bd) {
					bd = q;
					b = k;
				}
			});
			asg[i] = b;
			const a = acc[b]!;
			a[0]! += lab[p * 3]!;
			a[1]! += lab[p * 3 + 1]!;
			a[2]! += lab[p * 3 + 2]!;
			a[3]!++;
		});
		acc.forEach((a, k) => {
			if (a[3]) cen[k] = [a[0]! / a[3], a[1]! / a[3], a[2]! / a[3]];
		});
	}
	const share = cen.map((_, k) => asg.filter((v) => v === k).length / model.length);
	const bgC = cen.filter((_, k) => share[k]! >= 0.12);
	const tol = keyTol / 100;
	const dBg = new Float32Array(N);
	for (let p = 0; p < N; p++) {
		let m = 1e9;
		for (const c of bgC) m = Math.min(m, dist(p, c));
		dBg[p] = m;
	}
	const bg = new Uint8Array(N);
	const q = new Int32Array(N);
	let qh = 0;
	let qt = 0;
	for (const p of border) if (dBg[p]! < tol * 1.5 && !bg[p]) {
		bg[p] = 1;
		q[qt++] = p;
	}
	while (qh < qt) {
		const p = q[qh++]!;
		const px = p % w;
		const py = (p / w) | 0;
		for (const n of [px > 0 ? p - 1 : -1, px < w - 1 ? p + 1 : -1, py > 0 ? p - w : -1, py < h - 1 ? p + w : -1]) {
			if (n < 0 || bg[n]) continue;
			const step = Math.hypot(lab[n * 3]! - lab[p * 3]!, (lab[n * 3 + 1]! - lab[p * 3 + 1]!) * 1.4, (lab[n * 3 + 2]! - lab[p * 3 + 2]!) * 1.4);
			if (dBg[n]! < tol || (step < tol * 0.25 && dBg[n]! < tol * 3)) {
				bg[n] = 1;
				q[qt++] = n;
			}
		}
	}
	// Drop specks: subject pixels in a mostly-background neighborhood.
	let subj = 0;
	for (let p = 0; p < N; p++) {
		if (bg[p]) continue;
		const px = p % w;
		const py = (p / w) | 0;
		let nb = 0;
		let t = 0;
		for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
			const X = px + dx;
			const Y = py + dy;
			if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
			t++;
			nb += bg[Y * w + X]!;
		}
		if (nb / t > 0.8) d[p * 4 + 3] = 0;
		else subj++;
	}
	for (let p = 0; p < N; p++) if (bg[p]) d[p * 4 + 3] = 0;
	const frac = subj / N;
	if (frac < 0.005 || frac > 0.985) {
		for (let p = 0; p < N; p++) d[p * 4 + 3] = 255;
		return { pixels: base, info: 'no-background' };
	}
	// Soften the cut edge a touch (blur(1px) used as a mask) so edge dots antialias.
	const mask = blurAlpha(base, 1);
	for (let p = 0; p < N; p++) d[p * 4 + 3] = Math.round(d[p * 4 + 3]! * mask[p]!);
	return { pixels: base, info: 'removed' };
}

/** A grid of whole dots, centered in the area (the frame less its padding). */
export function grid(W: number, H: number, dot: number, gap: number, pad = 0): Grid {
	const pitch = Math.max(1, dot + gap);
	const aw = Math.max(1, W - 2 * pad);
	const ah = Math.max(1, H - 2 * pad);
	const cols = Math.min(500, Math.max(1, Math.floor((aw + gap) / pitch)));
	const rows = Math.min(500, Math.max(1, Math.floor((ah + gap) / pitch)));
	return { cols, rows, pitch, ox: (W - pitch * cols) / 2, oy: (H - pitch * rows) / 2 };
}

/** Where a picture lands: fitted into the area, scaled by `fit` percent, moved by offsets (shares of the frame). */
export function imageRect(W: number, H: number, iw: number, ih: number, fit: number, offX = 0, offY = 0, pad = 0): Rect {
	const aw = W - 2 * pad;
	const ah = H - 2 * pad;
	const sc = (Math.min(aw / iw, ah / ih) * fit) / 100;
	const w = iw * sc;
	const h = ih * sc;
	return { x: W / 2 - w / 2 + offX * W, y: H / 2 - h / 2 + offY * H, w, h };
}

type Sample = { m: Float32Array; L: Float32Array; e: Float32Array };

/** Per dot: coverage m, lightness L and edge e, 4 by 4 supersampled. */
function sample(cut: Pixels, g: Grid, R: Rect): Sample {
	const k = 4;
	const cw = g.cols * k;
	const ch = g.rows * k;
	const f = k / g.pitch;
	const drawn = drawImage(cut, cw, ch, (R.x - g.ox) * f, (R.y - g.oy) * f, R.w * f, R.h * f);
	const d = drawn.data;
	const P = cw * ch;
	const A = new Float32Array(P);
	const Lp = new Float32Array(P);
	for (let p = 0; p < P; p++) {
		A[p] = d[p * 4 + 3]! / 255;
		Lp[p] = lightness(d[p * 4]!, d[p * 4 + 1]!, d[p * 4 + 2]!);
	}
	// The photo's own frame is not a contour: outside the image, alpha repeats the nearest pixel inside it, and
	// coverage counts only the part inside.
	const x0 = (R.x - g.ox) * f;
	const x1 = (R.x + R.w - g.ox) * f;
	const y0 = (R.y - g.oy) * f;
	const y1 = (R.y + R.h - g.oy) * f;
	const inF = (X: number, Y: number) => X + 0.5 >= x0 && X + 0.5 <= x1 && Y + 0.5 >= y0 && Y + 0.5 <= y1;
	const cx0 = clamp(Math.ceil(x0), 0, cw - 1);
	const cx1 = clamp(Math.floor(x1) - 1, 0, cw - 1);
	const cy0 = clamp(Math.ceil(y0), 0, ch - 1);
	const cy1 = clamp(Math.floor(y1) - 1, 0, ch - 1);
	const Ae = A.slice();
	const Le = Lp.slice();
	for (let Y = 0; Y < ch; Y++) for (let X = 0; X < cw; X++) if (!inF(X, Y)) {
		const j = clamp(Y, cy0, cy1) * cw + clamp(X, cx0, cx1);
		Ae[Y * cw + X] = A[j]!;
		Le[Y * cw + X] = Lp[j]!;
	}
	// Sobel on light (inside the subject) and on alpha (the silhouette).
	const G = new Float32Array(P);
	for (let y = 1; y < ch - 1; y++) for (let X = 1; X < cw - 1; X++) {
		const p = y * cw + X;
		const s = (arr: Float32Array, mul: boolean) => {
			const v = (i: number) => arr[i]! * (mul ? Ae[i]! : 1);
			const gx = v(p - cw + 1) + 2 * v(p + 1) + v(p + cw + 1) - v(p - cw - 1) - 2 * v(p - 1) - v(p + cw - 1);
			const gy = v(p + cw - 1) + 2 * v(p + cw) + v(p + cw + 1) - v(p - cw - 1) - 2 * v(p - cw) - v(p - cw + 1);
			return Math.hypot(gx, gy);
		};
		G[p] = Math.max(s(Le, true), s(Ae, false) * 0.6);
	}
	const N = g.cols * g.rows;
	const m = new Float32Array(N);
	const L = new Float32Array(N);
	const e = new Float32Array(N);
	for (let r = 0; r < g.rows; r++) for (let q = 0; q < g.cols; q++) {
		let cov = 0, lum = 0, em = 0, fr = 0;
		for (let yy = 0; yy < k; yy++) for (let xx = 0; xx < k; xx++) {
			const Y = r * k + yy;
			const X = q * k + xx;
			const p = Y * cw + X;
			cov += A[p]!;
			lum += A[p]! * Lp[p]!;
			em += G[p]!;
			fr += inF(X, Y) ? 1 : 0;
		}
		const i = r * g.cols + q;
		m[i] = fr >= k * k * 0.25 ? cov / fr : 0;
		L[i] = cov > 0 ? lum / cov : 0;
		e[i] = em / (k * k);
	}
	return { m, L, e };
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export function hash(i: number) {
	let h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
	h ^= h >>> 13;
	h = Math.imul(h, 0xc2b2ae35);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function boxBlur(v: Float32Array, wt: Float32Array, cols: number, rows: number, r: number) {
	const out = new Float32Array(v.length);
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		let s = 0;
		let w = 0;
		for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
			const X = x + dx;
			const Y = y + dy;
			if (X < 0 || Y < 0 || X >= cols || Y >= rows) continue;
			const i = Y * cols + X;
			s += v[i]! * wt[i]!;
			w += wt[i]!;
		}
		out[y * cols + x] = w > 0 ? s / w : v[y * cols + x]!;
	}
	return out;
}

/** Light into a state per dot. `cut` comes from `cutout`. */
export function shade(cut: Pixels, g: Grid, R: Rect, o: ShaderOpts): States {
	const { cols, rows } = g;
	const N = cols * rows;
	const st = new Uint8Array(N);
	const sm = sample(cut, g, R);
	const inS = new Uint8Array(N);
	let n = 0;
	for (let i = 0; i < N; i++) if (sm.m[i]! >= 0.35) {
		inS[i] = 1;
		n++;
	}
	// Partly covered dots trace thin features and the edge as rings.
	const trace = (i: number) => !inS[i] && sm.m[i]! >= 0.1;
	if (!n) return st;
	if (o.render === 'silhouette') {
		for (let i = 0; i < N; i++) st[i] = inS[i] ? FILLED : trace(i) ? HOLLOW : FIELD;
		return st;
	}
	const light = o.dotsLight !== o.invert;
	let t = new Float32Array(N);
	for (let i = 0; i < N; i++) t[i] = light ? sm.L[i]! : 1 - sm.L[i]!;
	if (o.localContrast > 0 && o.render !== 'edges') {
		const r = Math.max(2, Math.round(Math.min(cols, rows) / 14));
		const bl = boxBlur(t, sm.m, cols, rows, r);
		const tt = new Float32Array(N);
		for (let i = 0; i < N; i++) tt[i] = t[i]! + o.localContrast * (t[i]! - bl[i]!);
		t = tt;
	}
	const es: number[] = [];
	for (let i = 0; i < N; i++) if (inS[i]) es.push(sm.e[i]!);
	es.sort((a, b) => a - b);
	const e95 = es[Math.floor(es.length * 0.95)] || 1e-6;
	const seed = o.seed ?? 0;
	const v = new Float32Array(N);
	for (let i = 0; i < N; i++) {
		if (!inS[i]) continue;
		const e = Math.min(1, sm.e[i]! / e95);
		v[i] = o.render === 'edges' ? e : o.render === 'tone' ? t[i]! : t[i]! + o.edgeAmt * e;
		v[i]! += hash(seed ? i ^ Math.imul(seed, 0x27d4eb2d) : i) * 1e-4;
	}
	// Rank-equalize inside the subject, so u is uniform in [0, 1].
	const idx: number[] = [];
	for (let i = 0; i < N; i++) if (inS[i]) idx.push(i);
	idx.sort((a, b) => v[a]! - v[b]! || a - b);
	const u = new Float32Array(N);
	idx.forEach((i, r) => (u[i] = (r + 0.5) / idx.length));
	const T1 = 1 - o.fillPct / 100;
	const T2 = Math.max(0, T1 - o.hollowPct / 100);
	const level = (x: number) => (x >= T1 ? FILLED : x >= T2 ? HOLLOW : EMPTY);
	const repOf = (s: number) => (s === FILLED ? (1 + T1) / 2 : s === HOLLOW ? (T1 + T2) / 2 : T2 / 2);
	if (o.dither === 'diffuse') {
		const err = new Float32Array(N);
		for (let y = 0; y < rows; y++) {
			const ltr = y % 2 === 0;
			for (let k = 0; k < cols; k++) {
				const x = ltr ? k : cols - 1 - k;
				const i = y * cols + x;
				if (!inS[i]) continue;
				const val = u[i]! + err[i]!;
				const s = level(val);
				st[i] = s;
				const e = val - repOf(s);
				const dir = ltr ? 1 : -1;
				const push = (X: number, Y: number, w: number) => {
					if (X < 0 || Y < 0 || X >= cols || Y >= rows) return;
					const j = Y * cols + X;
					if (inS[j]) err[j]! += e * w;
				};
				push(x + dir, y, 7 / 16);
				push(x - dir, y + 1, 3 / 16);
				push(x, y + 1, 5 / 16);
				push(x + dir, y + 1, 1 / 16);
			}
		}
	} else {
		for (const i of idx) {
			let val = u[i]!;
			if (o.dither === 'pattern') {
				const r = (i / cols) | 0;
				const c = i % cols;
				val += (BAYER[(r & 3) * 4 + (c & 3)]! - 0.5) * 0.22;
			}
			st[i] = level(val);
		}
	}
	for (let i = 0; i < N; i++) if (trace(i)) st[i] = HOLLOW;
	return st;
}
