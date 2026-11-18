import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';
import { brandFonts, surface, toPng, toSvg, tokenColor, type Ctx } from './canvas.js';
import { drawBurst, drawDotField, placePicture, type FieldColors, type Rect } from './dots.js';
import { pick } from './io.js';
import { drawLogo, drawMark, logoRatio, markRatio } from './logo.js';
import { paletteOf } from './og.js';
import type { Picture } from './picture.js';
import { drawFitted, fit } from './text.js';

// Merch print files (brand/assets/merch.json): each item's trim, bleed and safe area in inches, and a layout of logo,
// dots and words in inches from the trim. A file is the item at 300 pixels per inch with the bleed around it: SVG at
// physical size (inches on the root) and PNG at the asked dpi. Colors come only from the variant: a palette ground to
// the bleed, or the logo and dots alone in one brand color on a transparent ground. No mockups.

export const PX_PER_IN = 300;

type Layer =
	| { type: 'logo'; box: [number, number, number, number]; align?: 'left' | 'center'; part?: 'full' | 'mark' }
	| { type: 'dots'; mode: 'burst' | 'field' | 'picture'; box: [number, number, number, number]; center?: [number, number]; size?: number; dot?: number; gap?: number; mask?: 'fade-down' | 'edges' | 'band' }
	| { type: 'text'; slot: string; box: [number, number, number, number]; size: number; align?: 'left' | 'center'; face?: 'sans' | 'data'; maxLines?: number };

export type MerchItem = { id: string; name: string; size: [number, number]; bleed: number; safe: number; method: string; source: string; cut?: { radius: number }; variants: string[]; layers: Layer[] };
type Variant = { palette?: string; one?: string; ground: boolean };
type MerchDoc = { dpi: number; slots: Record<string, string>; variants: Record<string, Variant>; items: MerchItem[] };

let doc: MerchDoc | undefined;
export const merchDoc = (): MerchDoc => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'merch.json'), 'utf8')) as MerchDoc);
export const merchItems = () => merchDoc().items;
export const findItem = (id: string): MerchItem => {
	const name = pick('item', id, merchItems().map((i) => i.id));
	return merchItems().find((i) => i.id === name)!;
};

export function merchCatalog() {
	return {
		items: merchItems().map((i) => ({
			id: i.id,
			name: i.name,
			trim: { width: i.size[0], height: i.size[1], unit: 'in' },
			bleed: i.bleed,
			safe: i.safe,
			method: i.method,
			variants: i.variants,
			pixels: { width: Math.round((i.size[0] + 2 * i.bleed) * PX_PER_IN), height: Math.round((i.size[1] + 2 * i.bleed) * PX_PER_IN), dpi: PX_PER_IN },
			dieCut: Boolean(i.cut),
			slots: [...new Set(i.layers.flatMap((l) => (l.type === 'text' ? [l.slot] : [])))],
			picture: i.layers.some((l) => l.type === 'dots' && l.mode === 'picture'),
			source: i.source,
		})),
		variants: Object.entries(merchDoc().variants).map(([id, v]) => ({ id, ...v })),
	};
}

export type MerchRequest = { variant?: string; slots?: Record<string, string>; picture?: Picture | null; guides?: boolean };

/** Colors for a variant: the palette's, or one brand color for everything. */
function colorsOf(v: Variant): FieldColors & { mark: string; ink: string; text: string } {
	if (v.one) {
		const c = tokenColor(v.one);
		return { bg: v.one === 'white' ? tokenColor('black') : tokenColor('white'), fill: c, ring: c, field: c, fieldOp: 1, mark: c, ink: c, text: c };
	}
	const p = paletteOf({ palette: v.palette! });
	return { bg: p.bg, fill: p.fill, ring: p.ring, field: p.field, fieldOp: p.fieldOp, mark: p.mark, ink: p.ink, text: p.text };
}

/** Draws an item on a context in its own pixels (300 per inch, bleed included). */
export function drawItem(ctx: Ctx, item: MerchItem, req: MerchRequest = {}) {
	const variant = pick(`variant for ${item.id}`, req.variant ?? item.variants[0]!, item.variants);
	const v = merchDoc().variants[variant]!;
	const c = colorsOf(v);
	const o = item.bleed * PX_PER_IN;
	const W = (item.size[0] + 2 * item.bleed) * PX_PER_IN;
	const H = (item.size[1] + 2 * item.bleed) * PX_PER_IN;
	const px = (b: [number, number, number, number]): Rect => ({ x: b[0] * PX_PER_IN + o, y: b[1] * PX_PER_IN + o, w: b[2] * PX_PER_IN, h: b[3] * PX_PER_IN });
	const takes = new Set(item.layers.flatMap((l) => (l.type === 'text' ? [l.slot] : [])));
	for (const k of Object.keys(req.slots ?? {})) if (!takes.has(k)) throw new Error(`${item.id} does not draw --${k}.${takes.size ? ` It takes ${[...takes].map((s) => `--${s}`).join(', ')}.` : ' It takes no text.'}`);
	if (req.picture && !item.layers.some((l) => l.type === 'dots' && l.mode === 'picture')) throw new Error(`${item.id} holds no picture; --image goes with poster.`);
	const slots = { ...merchDoc().slots, ...req.slots };
	const fonts = brandFonts();
	if (v.ground) {
		ctx.fillStyle = c.bg;
		ctx.fillRect(0, 0, W, H);
	}
	// Words and logos first, so the dots keep clear of them.
	const keep: Rect[] = [];
	const texts: { f: ReturnType<typeof fit>; box: Rect }[] = [];
	for (const l of item.layers) {
		if (l.type === 'logo') {
			const b = px(l.box);
			const ratio = l.part === 'mark' ? markRatio() : logoRatio();
			const h = Math.min(b.h, b.w / ratio);
			const w = h * ratio;
			keep.push({ x: l.align === 'left' ? b.x : b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w, h });
		} else if (l.type === 'text') {
			const b = px(l.box);
			const value = slots[l.slot] ?? '';
			if (!value.trim()) continue;
			const style = l.face === 'data' ? { family: fonts.data, weight: 900, size: l.size * PX_PER_IN, tracking: 0.08, leading: 1.2, color: c.ink, caps: true, align: l.align ?? 'center' } : { family: fonts.sans, weight: 500, size: l.size * PX_PER_IN, tracking: -0.02, leading: 1.1, color: c.text, align: l.align ?? 'center' };
			const f = fit(ctx, value, style as never, b.w, l.maxLines ?? 2, 0.6, `${item.id} ${l.slot}`);
			texts.push({ f, box: b });
			keep.push({ x: l.align === 'left' ? b.x : b.x + (b.w - f.width) / 2, y: b.y, w: f.width, h: f.height });
		}
	}
	const pad = 0.12 * PX_PER_IN;
	for (const l of item.layers) {
		if (l.type !== 'dots') continue;
		const b = px(l.box);
		// A poster without a picture carries the burst instead.
		if (l.mode === 'burst' || (l.mode === 'picture' && !req.picture)) {
			const R = Math.sqrt(b.w * b.h) * (l.size ?? 1);
			drawBurst(ctx, { width: W, height: H, cx: b.x + (l.center?.[0] ?? 0.5) * b.w, cy: b.y + (l.center?.[1] ?? 0.5) * b.h, R, fill: c.fill, ring: c.ring, keep, pad });
			continue;
		}
		const dot = (l.dot ?? 0.1) * PX_PER_IN;
		const gap = (l.gap ?? 0.08) * PX_PER_IN;
		// Fading down: the dots shrink to nothing over the box, as the burst's grow toward the light.
		const size = l.mask === 'fade-down' ? (_x: number, y: number) => Math.min(1, Math.max(0, 1 - (y - b.y) / (b.h * 0.9))) : undefined;
		const mask = l.mask === 'edges'
				? (x: number, y: number) => {
						const d = Math.max((Math.abs(x - (b.x + b.w / 2)) / (b.w / 2)) * 1.1, (Math.abs(y - (b.y + b.h / 2)) / (b.h / 2)) * 1.4);
						return (d - 0.55) / 0.35;
					}
				: l.mask === 'band'
					? (_x: number, y: number) => (Math.abs((y - b.y) / b.h - 0.5) > 0.22 ? 1 : 0)
					: undefined;
		// A field bleeds with the ground; on a transparent ground it stays inside the trim.
		const area = v.ground ? { x: 0, y: 0, w: W, h: H } : b;
		const pic = l.mode === 'picture' ? req.picture : null;
		const fieldMode = l.mode === 'picture' ? (v.ground ? 'faint' : 'none') : 'faint';
		const colors = { ...c, field: l.mode === 'field' ? c.fill : c.field, fieldOp: l.mode === 'field' ? (v.one ? 1 : 0.55) : c.fieldOp };
		ctx.save();
		ctx.translate(area.x, area.y);
		drawDotField(ctx, {
			width: area.w,
			height: area.h,
			dot,
			gap,
			colors,
			field: fieldMode,
			picture: pic,
			rect: pic ? placePicture(pic, { x: b.x - area.x, y: b.y - area.y, w: b.w, h: b.h }, 92) : undefined,
			keep: keep.map((k) => ({ ...k, x: k.x - area.x, y: k.y - area.y })),
			pad,
			mask: mask ? (x, y) => mask(x + area.x, y + area.y) : undefined,
			size: size ? (x, y) => size(x + area.x, y + area.y) : undefined,
		});
		ctx.restore();
	}
	for (const l of item.layers) {
		if (l.type !== 'logo') continue;
		const b = px(l.box);
		if (l.part === 'mark') {
			const h = Math.min(b.h, b.w / markRatio());
			drawMark(ctx, b.x + (b.w - h * markRatio()) / 2, b.y + (b.h - h) / 2, h, c.mark);
		} else {
			const h = Math.min(b.h, b.w / logoRatio());
			const w = h * logoRatio();
			drawLogo(ctx, l.align === 'left' ? b.x : b.x + (b.w - w) / 2, b.y + (b.h - h) / 2, h, c.mark, c.ink);
		}
	}
	for (const t of texts) drawFitted(ctx, t.f, t.box.x, t.box.y, t.box.w);
	if (req.guides) {
		ctx.save();
		ctx.strokeStyle = tokenColor('chart-series-1');
		ctx.lineWidth = 3;
		if (item.bleed) ctx.strokeRect(o, o, item.size[0] * PX_PER_IN, item.size[1] * PX_PER_IN);
		const s = item.safe * PX_PER_IN;
		ctx.setLineDash([18, 12]);
		ctx.strokeRect(o + s, o + s, item.size[0] * PX_PER_IN - 2 * s, item.size[1] * PX_PER_IN - 2 * s);
		ctx.restore();
	}
	return { variant, width: W, height: H };
}

/** The die line (the cutter's CutContour spot path) for an item with a cut: in the SVG only, never printed. */
function cutPath(item: MerchItem): string {
	if (!item.cut) return '';
	const o = item.bleed * PX_PER_IN;
	const w = item.size[0] * PX_PER_IN;
	const h = item.size[1] * PX_PER_IN;
	const r = item.cut.radius * PX_PER_IN;
	const d = `M${o + r} ${o}H${o + w - r}A${r} ${r} 0 0 1 ${o + w} ${o + r}V${o + h - r}A${r} ${r} 0 0 1 ${o + w - r} ${o + h}H${o + r}A${r} ${r} 0 0 1 ${o} ${o + h - r}V${o + r}A${r} ${r} 0 0 1 ${o + r} ${o}Z`;
	return `<g id="CutContour"><path d="${d}" fill="none" stroke="#FF00FF" stroke-width="3"/></g>`;
}

export type MerchRender = { png?: Buffer; svg?: string; variant: string; width: number; height: number; widthIn: number; heightIn: number; dpi: number };

/** An item as print files: SVG at physical size (with the die line, if any) and PNG at `dpi` (72 to 600). */
export function renderItem(item: MerchItem, req: MerchRequest & { png?: boolean; svg?: boolean; dpi?: number } = {}): MerchRender {
	const widthIn = item.size[0] + 2 * item.bleed;
	const heightIn = item.size[1] + 2 * item.bleed;
	const W = Math.round(widthIn * PX_PER_IN);
	const H = Math.round(heightIn * PX_PER_IN);
	const dpi = req.dpi ?? PX_PER_IN;
	const out: MerchRender = { variant: '', width: Math.round(widthIn * dpi), height: Math.round(heightIn * dpi), widthIn, heightIn, dpi };
	if (req.png !== false) {
		const s = surface(W, H, { scale: dpi / PX_PER_IN });
		out.variant = drawItem(s.ctx, item, req).variant;
		out.png = toPng(s, { dpi });
	}
	if (req.svg) {
		const s = surface(W, H, { svg: true });
		out.variant = drawItem(s.ctx, item, req).variant;
		out.svg = toSvg(s, { widthIn, heightIn }).replace(/<\/svg>\s*$/, `${cutPath(item)}</svg>\n`);
	}
	return out;
}
