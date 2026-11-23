import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';
import { brandFonts, pixelsOf, surface, toPng, toSvg, tokenColor, type Ctx } from './canvas.js';
import { drawBurst, drawDotField, placePicture, type FieldColors, type Rect } from './dots.js';
import { checkDesign, type DesignDoc, type DrawnLayer, type Finding, type TemplateInfo } from '../design/index.js';
import { brand } from '../lib/brand.js';
import { assertGlyphs } from './glyphs.js';
import { pick } from './io.js';
import { drawLogo, drawMark, logoClear, logoRatio, markRatio } from './logo.js';
import { paletteOf } from './og.js';
import { imagesToPdf } from './pdf.js';
import { sampleNames } from './samples.js';
import type { Picture } from './picture.js';
import { drawFitted, fit } from './text.js';

// Merch print files (brand/assets/merch.json): each item's trim, bleed and safe area in inches, and a layout of logo,
// dots and words in inches from the trim. A file is the item at 300 pixels per inch with the bleed around it: SVG at
// physical size (inches on the root) and PNG at the asked dpi. Colors come only from the variant: a palette ground to
// the bleed, or the logo and dots alone in one brand color on a transparent ground. No mockups.

export const PX_PER_IN = 300;
/** The smallest the logo is printed, in inches. Our own floor; the brand publishes none. */
const MIN_LOGO_IN = 0.25;

type Layer =
	| { type: 'logo'; box: [number, number, number, number]; align?: 'left' | 'center'; part?: 'full' | 'mark' }
	| { type: 'dots'; mode: 'burst' | 'field' | 'picture'; box: [number, number, number, number]; center?: [number, number]; size?: number; dot?: number; gap?: number; mask?: 'fade-down' | 'edges' | 'band' }
	| { type: 'text'; slot: string; box: [number, number, number, number]; size: number; align?: 'left' | 'center'; face?: 'sans' | 'data'; maxLines?: number };

export type MerchItem = { id: string; name: string; size: [number, number]; bleed: number; safe: number; method: string; source: string; cut?: { radius: number }; variants: string[]; layers: Layer[] };
type Variant = { palette?: string; one?: string; ground: boolean };
type MerchDoc = { dpi: number; own: Record<string, string>; sample: Record<string, string>; variants: Record<string, Variant>; items: MerchItem[] };

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
			slots: itemSlots(i),
			picture: i.layers.some((l) => l.type === 'dots' && l.mode === 'picture'),
			source: i.source,
		})),
		variants: Object.entries(merchDoc().variants).map(([id, v]) => ({ id, ...v })),
	};
}

export type MerchRequest = { variant?: string; slots?: Record<string, string>; picture?: Picture | null; guides?: boolean; sample?: boolean; seed?: number };

/** Colors for a variant: the palette's, or one brand color for everything. */
function colorsOf(v: Variant): FieldColors & { mark: string; ink: string; text: string } {
	if (v.one) {
		const c = tokenColor(v.one);
		return { bg: v.one === 'white' ? tokenColor('black') : tokenColor('white'), fill: c, ring: c, field: c, fieldOp: 1, mark: c, ink: c, text: c };
	}
	const p = paletteOf({ palette: v.palette! });
	return { bg: p.bg, fill: p.fill, ring: p.ring, field: p.field, fieldOp: p.fieldOp, mark: p.mark, ink: p.ink, text: p.text };
}

/** The words an item takes. */
export const itemSlots = (item: MerchItem) => [...new Set(item.layers.flatMap((l) => (l.type === 'text' ? [l.slot] : [])))];

/** Draws an item on a context in its own pixels (300 per inch, bleed included) and reports what it drew. Only the words
 * that were passed are printed (the poster's address is the brand's own). */
export function drawItem(ctx: Ctx, item: MerchItem, req: MerchRequest = {}) {
	const variant = pick(`variant for ${item.id}`, req.variant ?? item.variants[0]!, item.variants);
	const v = merchDoc().variants[variant]!;
	const c = colorsOf(v);
	const o = item.bleed * PX_PER_IN;
	const W = (item.size[0] + 2 * item.bleed) * PX_PER_IN;
	const H = (item.size[1] + 2 * item.bleed) * PX_PER_IN;
	const px = (b: [number, number, number, number]): Rect => ({ x: b[0] * PX_PER_IN + o, y: b[1] * PX_PER_IN + o, w: b[2] * PX_PER_IN, h: b[3] * PX_PER_IN });
	const takes = new Set(itemSlots(item));
	for (const k of Object.keys(req.slots ?? {})) if (!takes.has(k)) throw new Error(`${item.id} does not draw --${k}.${takes.size ? ` It takes ${[...takes].map((s) => `--${s}`).join(', ')}.` : ' It takes no text.'}`);
	if (req.picture && !item.layers.some((l) => l.type === 'dots' && l.mode === 'picture')) throw new Error(`${item.id} holds no picture; --image goes with poster.`);
	const slots: Record<string, string> = { ...merchDoc().own, ...(req.sample ? merchDoc().sample : {}), ...req.slots };
	for (const [k, t] of Object.entries(slots)) if (takes.has(k)) assertGlyphs(k, k === 'url' ? t.toUpperCase() : t, k === 'url' ? 'data' : 'sans');
	const fonts = brandFonts();
	const layers: DrawnLayer[] = [];
	// A line that was not passed is left out, and a logo under it moves up into its place.
	const gone = item.layers.find((l) => l.type === 'text' && l.slot !== 'url' && !slots[l.slot]?.trim());
	const parts = gone ? item.layers.map((l) => (l.type === 'logo' && l.box[1] > gone.box[1] ? { ...l, box: [l.box[0], gone.box[1] + 0.4, l.box[2], l.box[3]] as Layer['box'] } : l)) : item.layers;
	if (v.ground) {
		ctx.fillStyle = c.bg;
		ctx.fillRect(0, 0, W, H);
	}
	// Words and logos first, so the dots keep clear of them.
	const pad = 0.12 * PX_PER_IN;
	const keep: Rect[] = [];
	const texts: { f: ReturnType<typeof fit>; box: Rect; slot: string; asked: string }[] = [];
	for (const l of parts) {
		if (l.type === 'logo') {
			const b = px(l.box);
			const ratio = l.part === 'mark' ? markRatio() : logoRatio();
			const h = Math.min(b.h, b.w / ratio);
			const w = h * ratio;
			const more = Math.max(0, logoClear(h) - pad);
			keep.push({ x: (l.align === 'left' ? b.x : b.x + (b.w - w) / 2) - more, y: b.y + (b.h - h) / 2 - more, w: w + more * 2, h: h + more * 2 });
		} else if (l.type === 'text') {
			const b = px(l.box);
			const value = slots[l.slot] ?? '';
			if (!value.trim()) continue;
			const style = l.face === 'data' ? { family: fonts.data, weight: 900, size: l.size * PX_PER_IN, tracking: 0.08, leading: 1.2, color: c.ink, caps: true, align: l.align ?? 'center' } : { family: fonts.sans, weight: 500, size: l.size * PX_PER_IN, tracking: -0.02, leading: 1.1, color: c.text, align: l.align ?? 'center' };
			const f = fit(ctx, value, style as never, b.w, l.maxLines ?? 2, 0.6, `${item.id} ${l.slot}`);
			texts.push({ f, box: b, slot: l.slot, asked: value });
			keep.push({ x: l.align === 'left' ? b.x : b.x + (b.w - f.width) / 2, y: b.y, w: f.width, h: f.height });
		}
	}
	let logos = 0;
	const logoId = () => (logos++ ? `logo-${logos}` : 'logo');
	for (const l of parts) {
		if (l.type !== 'dots') continue;
		const b = px(l.box);
		const ink: Rect[] = [];
		// A poster without a picture carries the burst instead.
		if (l.mode === 'burst' || (l.mode === 'picture' && !req.picture)) {
			const R = Math.sqrt(b.w * b.h) * (l.size ?? 1);
			drawBurst(ctx, { width: W, height: H, cx: b.x + (l.center?.[0] ?? 0.5) * b.w, cy: b.y + (l.center?.[1] ?? 0.5) * b.h, R, fill: c.fill, ring: c.ring, keep, pad, ink, turn: req.seed ? ((req.seed - 1) * 0.618) % 1 : 0 });
			if (ink.length) layers.push({ id: 'art', kind: 'art', box: { x: 0, y: 0, w: W, h: H }, ink, bleeds: true, can: {} });
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
			ink,
		});
		ctx.restore();
		if (ink.length) layers.push({ id: layers.some((x) => x.id === 'art') ? 'field' : 'art', kind: 'art', box: area, ink: ink.map((r) => ({ ...r, x: r.x + area.x, y: r.y + area.y })), bleeds: true, can: {} });
	}
	for (const l of parts) {
		if (l.type !== 'logo') continue;
		const b = px(l.box);
		if (l.part === 'mark') {
			const h = Math.min(b.h, b.w / markRatio());
			const r = { x: b.x + (b.w - h * markRatio()) / 2, y: b.y + (b.h - h) / 2, w: h * markRatio(), h };
			drawMark(ctx, r.x, r.y, h, c.mark);
			layers.push({ id: logoId(), kind: 'logo', box: r, logo: { clear: logoClear(h), min: MIN_LOGO_IN * PX_PER_IN }, can: {} });
		} else {
			const h = Math.min(b.h, b.w / logoRatio());
			const w = h * logoRatio();
			const r = { x: l.align === 'left' ? b.x : b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w, h };
			drawLogo(ctx, r.x, r.y, h, c.mark, c.ink);
			layers.push({ id: logoId(), kind: 'logo', box: r, logo: { clear: logoClear(h), min: MIN_LOGO_IN * PX_PER_IN }, can: {} });
		}
	}
	for (const t of texts) {
		const box = drawFitted(ctx, t.f, t.box.x, t.box.y, t.box.w);
		const ink = t.f.style.color ?? c.text;
		layers.push({ id: t.slot, kind: 'text', box, text: { asked: t.asked, drawn: t.f.lines.join('\n'), size: t.f.size, color: ink, ground: [c.bg], ...(merchDoc().own[t.slot] === t.asked ? { own: true } : {}) }, can: {} });
	}
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
	return { variant, width: W, height: H, layers, ground: c.bg };
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

export type MerchRender = { layers: DrawnLayer[]; png?: Buffer; svg?: string; pdf?: Buffer; variant: string; width: number; height: number; widthIn: number; heightIn: number; dpi: number };

/** An item as print files: SVG at physical size (with the die line, if any) and PNG at `dpi` (72 to 600). */
export function renderItem(item: MerchItem, req: MerchRequest & { png?: boolean; svg?: boolean; pdf?: boolean; dpi?: number } = {}): MerchRender {
	const widthIn = item.size[0] + 2 * item.bleed;
	const heightIn = item.size[1] + 2 * item.bleed;
	const W = Math.round(widthIn * PX_PER_IN);
	const H = Math.round(heightIn * PX_PER_IN);
	const dpi = req.dpi ?? PX_PER_IN;
	const out: MerchRender = { layers: [], variant: '', width: Math.round(widthIn * dpi), height: Math.round(heightIn * dpi), widthIn, heightIn, dpi };
	if (req.png !== false || req.pdf) {
		const s = surface(W, H, { scale: dpi / PX_PER_IN });
		const r = drawItem(s.ctx, item, req);
		out.variant = r.variant;
		out.layers = r.layers;
		if (req.png !== false) out.png = toPng(s, { dpi });
		if (req.pdf) {
			// A PDF page has no transparency here: a transparent variant is printed on its own ground color.
			const px = pixelsOf(s);
			const [br, bg, bb] = [1, 3, 5].map((i) => Number.parseInt(r.ground.slice(i, i + 2), 16)) as [number, number, number];
			const rgb = Buffer.alloc(px.width * px.height * 3);
			for (let i = 0, j = 0; i < px.data.length; i += 4, j += 3) {
				const a = px.data[i + 3]! / 255;
				rgb[j] = Math.round(px.data[i]! * a + br * (1 - a));
				rgb[j + 1] = Math.round(px.data[i + 1]! * a + bg * (1 - a));
				rgb[j + 2] = Math.round(px.data[i + 2]! * a + bb * (1 - a));
			}
			out.pdf = imagesToPdf([{ rgb, width: px.width, height: px.height }], widthIn * 72);
		}
	}
	if (req.svg) {
		const s = surface(W, H, { svg: true });
		const r = drawItem(s.ctx, item, req);
		out.variant = r.variant;
		out.layers = r.layers;
		out.svg = toSvg(s, { widthIn, heightIn }).replace(/<\/svg>\s*$/, `${cutPath(item)}</svg>\n`);
	}
	return out;
}

/** What an item takes, as the design core reads it. */
export function merchInfo(item: MerchItem): TemplateInfo {
	const pic = item.layers.some((l) => l.type === 'dots' && l.mode === 'picture');
	const v = (id: string) => merchDoc().variants[id]!;
	return {
		id: item.id,
		kind: 'merch',
		description: `${item.name}, ${item.size[0]} by ${item.size[1]} in print file (${item.method}).`,
		sizes: ['print'],
		themes: item.variants,
		copy: itemSlots(item).map((id) => ({ id })),
		images: pic ? [{ id: 'picture', values: sampleNames().map((n) => `sample:${n}`) }] : [],
		options: [{ id: 'dpi', range: [72, 600] }, { id: 'guides', values: ['true', 'false'], description: 'draw the trim and safe lines for proofing' }],
		layers: [],
		grounds: Object.fromEntries(item.variants.map((id) => [id, colorsOf(v(id)).bg])),
		formats: ['png', 'svg', 'pdf'],
		layouts: [item.name.toLowerCase()],
	};
}

/** Everything wrong with a drawn item: the logo, whole words, and that words and logos keep to the safe area. */
export function checkItem(item: MerchItem, r: Pick<MerchRender, 'layers'>, req: { slots?: Record<string, string>; sample?: boolean } = {}): Finding[] {
	const own = merchDoc().own;
	const copy = Object.fromEntries(Object.entries({ ...(req.sample ? merchDoc().sample : {}), ...req.slots }).filter(([k, v]) => itemSlots(item).includes(k) && v.trim() && own[k] !== v));
	const W = (item.size[0] + 2 * item.bleed) * PX_PER_IN;
	const H = (item.size[1] + 2 * item.bleed) * PX_PER_IN;
	const d = { version: 1, brand: brand().bin, kind: 'merch', template: item.id, size: { id: 'print', width: W, height: H }, copy, images: {}, options: {}, layers: {}, history: [], future: [] } as DesignDoc;
	const out = checkDesign({ doc: d, info: merchInfo(item), layers: r.layers, adapter: {} });
	const s = (item.bleed + item.safe) * PX_PER_IN - 1;
	for (const l of r.layers) if ((l.kind === 'text' || l.kind === 'logo') && (l.box.x < s || l.box.y < s || l.box.x + l.box.w > W - s || l.box.y + l.box.h > H - s)) out.push({ rule: 'safe-area', severity: 'error', allowable: false, layers: [l.id], message: `The ${l.id} leaves the item's safe area (${item.safe} in inside the trim).` });
	return out;
}
