import type { Pixels } from './png.js';
import { hexRgb } from './raster.js';

// An illustration is a list of dot layers, each a role (field, hollow, filled) of same-styled circles. SVG, PNG and
// the Figma script are all written from it, so they always agree.

/** `token` is the brand color the layer was drawn in, so Figma can bind it to its variable. */
export type Layer = { id: string; kind: 'fill' | 'ring'; color: string; token?: string; opacity: number; stroke?: number; circles: number[] };
/** `grid` is the lattice the dots sit on (centers at ox + (i + 0.5) * pitch), when they sit on one. */
export type Illustration = { width: number; height: number; background: string | null; backgroundToken?: string; layers: Layer[]; title: string; desc: string; grid?: { ox: number; oy: number; pitch: number } };

export const r2 = (n: number) => Math.round(n * 100) / 100;

export const countDots = (ill: Illustration) => Object.fromEntries(ill.layers.map((l) => [l.id, l.circles.length / 3]));

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A plain SVG: a named background rect and one named group per layer, every dot a real circle. */
export function toSvg(ill: Illustration): string {
	const { width: W, height: H } = ill;
	const out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`, `<title>${esc(ill.title)}</title>`, `<desc>${esc(ill.desc)}</desc>`];
	if (ill.background) out.push(`<rect id="background" width="${W}" height="${H}" fill="${ill.background}"/>`);
	for (const l of ill.layers) {
		if (!l.circles.length) continue;
		const op = l.opacity < 1 ? ` opacity="${r2(l.opacity)}"` : '';
		out.push(l.kind === 'ring' ? `<g id="${l.id}" fill="none" stroke="${l.color}" stroke-width="${l.stroke}"${op}>` : `<g id="${l.id}" fill="${l.color}"${op}>`);
		const c = l.circles;
		for (let i = 0; i < c.length; i += 3) out.push(`<circle cx="${r2(c[i]!)}" cy="${r2(c[i + 1]!)}" r="${r2(c[i + 2]!)}"/>`);
		out.push('</g>');
	}
	out.push('</svg>');
	return `${out.join('\n')}\n`;
}

const SS = 4;

/** Rasterizes the illustration at `scale`: each layer's coverage is the union of its circles (as SVG group opacity). */
export function toPixels(ill: Illustration, scale = 1): Pixels {
	const W = Math.round(ill.width * scale);
	const H = Math.round(ill.height * scale);
	const px = new Float32Array(W * H * 4);
	if (ill.background) {
		const [r, g, b] = hexRgb(ill.background);
		for (let i = 0; i < W * H; i++) {
			px[i * 4] = r / 255;
			px[i * 4 + 1] = g / 255;
			px[i * 4 + 2] = b / 255;
			px[i * 4 + 3] = 1;
		}
	}
	const cov = new Float32Array(W * H);
	for (const l of ill.layers) {
		if (!l.circles.length) continue;
		cov.fill(0);
		const hw = ((l.stroke ?? 0) * scale) / 2;
		const c = l.circles;
		for (let n = 0; n < c.length; n += 3) {
			const cx = c[n]! * scale;
			const cy = c[n + 1]! * scale;
			const r = c[n + 2]! * scale;
			const outer = l.kind === 'ring' ? r + hw : r;
			const inner = l.kind === 'ring' ? Math.max(0, r - hw) : -1;
			const X0 = Math.max(0, Math.floor(cx - outer));
			const X1 = Math.min(W - 1, Math.ceil(cx + outer));
			const Y0 = Math.max(0, Math.floor(cy - outer));
			const Y1 = Math.min(H - 1, Math.ceil(cy + outer));
			const o2 = outer * outer;
			const i2 = inner < 0 ? -1 : inner * inner;
			for (let Y = Y0; Y <= Y1; Y++) for (let X = X0; X <= X1; X++) {
				let hits = 0;
				for (let sy = 0; sy < SS; sy++) {
					const dy = Y + (sy + 0.5) / SS - cy;
					for (let sx = 0; sx < SS; sx++) {
						const dx = X + (sx + 0.5) / SS - cx;
						const d2 = dx * dx + dy * dy;
						if (d2 <= o2 && d2 >= i2) hits++;
					}
				}
				if (hits) cov[Y * W + X] = Math.max(cov[Y * W + X]!, hits / (SS * SS));
			}
		}
		const [r, g, b, a0] = hexRgb(l.color);
		const alpha = a0 * l.opacity;
		for (let i = 0; i < W * H; i++) {
			const k = cov[i]! * alpha;
			if (!k) continue;
			const o = i * 4;
			px[o] = (r / 255) * k + px[o]! * (1 - k);
			px[o + 1] = (g / 255) * k + px[o + 1]! * (1 - k);
			px[o + 2] = (b / 255) * k + px[o + 2]! * (1 - k);
			px[o + 3] = k + px[o + 3]! * (1 - k);
		}
	}
	const data = new Uint8ClampedArray(W * H * 4);
	for (let i = 0; i < W * H; i++) {
		const a = px[i * 4 + 3]!;
		data[i * 4 + 3] = Math.round(a * 255);
		if (a > 0) for (let k = 0; k < 3; k++) data[i * 4 + k] = Math.round(Math.min(1, px[i * 4 + k]! / a) * 255);
	}
	return { width: W, height: H, data };
}
