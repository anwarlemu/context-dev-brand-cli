import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';
import { brandFonts, surface, toPng, toSvg, pixelsOf, tokenColor, type Ctx, type Fonts } from './canvas.js';
import { drawBurst, drawDotField, dotIcon, dotText, placePicture, type Rect } from './dots.js';
import { pick } from './io.js';
import { drawLogo, logoRatio } from './logo.js';
import { designFor, drawDesign, paletteOf, palettes, type Palette } from './og.js';
import type { Picture } from './picture.js';
import { drawFitted, fit, setFont } from './text.js';

// Deck slides at 1920 by 1080 (brand/assets/deck.json): cover, section, statement, bullets, stat, quote, image and
// closing. Each is drawn from the share images' rules: the logo top left at their unit, the headline in the brand sans
// at 500 and -0.02em, a palette from image.json (tokens only), dots kept clear of the words, pictures through the dot
// shader. The stat and image slides are the customer story and announcement layouts at this size.

export type SlideType = 'cover' | 'section' | 'statement' | 'bullets' | 'stat' | 'quote' | 'image' | 'closing';
type DeckDoc = { width: number; height: number; slides: Record<SlideType, { name: string; description: string; palette: string; slots: Record<string, string> }> };

let doc: DeckDoc | undefined;
export const deckDoc = (): DeckDoc => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'deck.json'), 'utf8')) as DeckDoc);
export const slideTypes = () => Object.keys(deckDoc().slides) as SlideType[];

export type Slide = { type: string; palette?: string; picture?: Picture | null } & Record<string, unknown>;

export function deckCatalog() {
	const d = deckDoc();
	return {
		size: { width: d.width, height: d.height },
		slides: slideTypes().map((id) => ({ id, name: d.slides[id].name, description: d.slides[id].description, palette: d.slides[id].palette, slots: d.slides[id].slots })),
		palettes: palettes().map((p) => p.name),
	};
}

/** The slots a slide type takes, with what it was given over its opening copy. Unknown slots throw. */
export function slotsFor(type: SlideType, given: Record<string, unknown>): Record<string, string> {
	const def = deckDoc().slides[type].slots;
	const out: Record<string, string> = { ...def };
	for (const [k, v] of Object.entries(given)) {
		if (['type', 'palette', 'picture', 'image'].includes(k) && !(k in def)) continue;
		if (!(k in def)) throw new Error(`A ${type} slide does not take "${k}". It takes ${Object.keys(def).map((s) => `"${s}"`).join(', ')}.`);
		if (Array.isArray(v) && v.every((x) => typeof x === 'string')) out[k] = v.join(' | ');
		else if (typeof v === 'string') out[k] = v;
		else throw new Error(`A ${type} slide's "${k}" takes text.`);
	}
	return out;
}

const W = 1920;
const H = 1080;
const U = Math.sqrt(W * H) / 900;
const M = 32 * U;
const LOGO: Rect = { x: M, y: 36 * U, w: logoRatio() * 32 * U, h: 32 * U };

/** Draws one slide on a 1920 by 1080 context. */
export function drawSlide(ctx: Ctx, slide: Slide, fonts: Fonts = brandFonts()) {
	const type = pick('slide type', slide.type, slideTypes());
	const slots = slotsFor(type, slide);
	const p = paletteOf({ palette: slide.palette ? pick('palette', slide.palette, palettes().map((x) => x.name)) : deckDoc().slides[type].palette });
	const pic = slide.picture ?? null;
	ctx.fillStyle = p.bg;
	ctx.fillRect(0, 0, W, H);
	ctx.textBaseline = 'alphabetic';
	const head = (size: number) => ({ family: fonts.sans, weight: 500, size, tracking: -0.02, leading: 1.2, color: p.text });
	const body = (size: number, color = p.ink) => ({ family: fonts.sans, weight: 400, size, tracking: 0, leading: 1.45, color });

	switch (type) {
		case 'cover': {
			const t = fit(ctx, slots.title!, { ...head(150), tracking: -0.03, leading: 1.04 }, W * 0.56, 3, 0.5, 'title');
			const b = slots.body ? fit(ctx, slots.body, body(46), W * 0.5, 3, 0.6, 'body') : undefined;
			const blockH = t.height + (b ? 40 + b.height : 0);
			const top = Math.max(LOGO.y + LOGO.h + 80, (H - blockH) / 2 + 30);
			const keep = [LOGO, { x: M, y: top, w: t.width, h: t.height }];
			if (b) keep.push({ x: M, y: top + t.height + 40, w: b.width, h: b.height });
			if (pic) drawDotField(ctx, { width: W, height: H, dot: 7.6, gap: 3.8, colors: p, picture: pic, rect: placePicture(pic, { x: W * 0.5, y: 0, w: W * 0.5, h: H }, 92), keep, pad: 16 * U });
			else drawBurst(ctx, { width: W, height: H, cx: W * 1.02, cy: H * 0.5, R: Math.sqrt(W * H), fill: p.fill, ring: p.ring, keep, pad: 16 * U });
			drawLogo(ctx, LOGO.x, LOGO.y, LOGO.h, p.mark, p.ink);
			drawFitted(ctx, t, M, top);
			if (b) drawFitted(ctx, b, M, top + t.height + 40);
			break;
		}
		case 'section': {
			const n = slots.number ?? '';
			const statSize = 230;
			setFont(ctx, { family: fonts.sans, weight: 700, size: statSize, tracking: 0.03 });
			const nw = n ? ctx.measureText(n).width : 0;
			ctx.letterSpacing = '0px';
			const t = fit(ctx, slots.title!, head(120), W * 0.7, 2, 0.5, 'title');
			const nh = n ? statSize * 0.86 : 0;
			const top = (H - (nh + 24 + t.height)) / 2 + 20;
			const keep = [LOGO, { x: M * 2, y: top, w: nw, h: nh }, { x: M * 2, y: top + nh + 24, w: t.width, h: t.height }];
			drawDotField(ctx, { width: W, height: H, dot: 6, gap: 10, colors: p, field: 'rings', keep, pad: 24 * U });
			drawLogo(ctx, LOGO.x, LOGO.y, LOGO.h, p.mark, p.ink);
			ctx.fillStyle = p.text;
			if (n) dotText(ctx, n, M * 2, top, statSize, statSize * 0.86, fonts.sans);
			drawFitted(ctx, t, M * 2, top + nh + 24);
			break;
		}
		case 'statement': {
			const t = fit(ctx, slots.title!, { ...head(96), color: p.text, align: 'center', leading: 1.16 }, W * 0.72, 4, 0.5, 'title');
			const top = (H - t.height) / 2;
			const box = { x: (W - t.width) / 2, y: top, w: t.width, h: t.height };
			// The reel's tagline: dots gather at the edges and thin out toward the words.
			const mask = (x: number, y: number) => {
				const d = Math.max((Math.abs(x - W / 2) / (W / 2)) * 1.1, (Math.abs(y - H / 2) / (H / 2)) * 1.4);
				return Math.min(1, Math.max(0, (d - 0.55) / 0.35));
			};
			drawDotField(ctx, { width: W, height: H, dot: 8.8, gap: 31.2, colors: { ...p, field: p.fill, fieldOp: 1 }, field: 'faint', keep: [box, LOGO], pad: 24 * U, mask });
			drawLogo(ctx, LOGO.x, LOGO.y, LOGO.h, p.mark, p.ink);
			drawFitted(ctx, t, 0, top, W);
			break;
		}
		case 'bullets': {
			const items = (slots.items ?? '').split('|').map((s) => s.trim()).filter(Boolean);
			if (items.length > 8) throw new Error(`A bullets slide holds up to 8 points; it was given ${items.length}. Split it.`);
			const t = fit(ctx, slots.title!, head(88), W - M * 4, 2, 0.6, 'title');
			const top = LOGO.y + LOGO.h + 110;
			const cols = items.length > 4 ? 2 : 1;
			const colW = (W - M * 4 - (cols - 1) * 80) / cols;
			const itemSize = 46;
			const fitted = items.map((it) => fit(ctx, it, body(itemSize, p.ink), colW - 70, 2, 0.7, 'point'));
			const size = Math.min(...fitted.map((f) => f.size));
			const listTop = top + t.height + 80;
			const keep: Rect[] = [LOGO, { x: M * 2, y: top, w: t.width, h: t.height }];
			const placed = fitted.map((f, i) => {
				const col = cols === 2 ? Math.floor(i / Math.ceil(items.length / 2)) : 0;
				const row = cols === 2 ? i % Math.ceil(items.length / 2) : i;
				const g = fit(ctx, items[i]!, body(size, p.ink), colW - 70, 2, 1, 'point');
				const y = listTop + row * (size * 1.45 * 2 + 28);
				const x = M * 2 + col * (colW + 80);
				keep.push({ x, y, w: 70 + g.width, h: g.height });
				return { g, x, y };
			});
			drawDotField(ctx, { width: W, height: H, dot: 6, gap: 10, colors: p, field: 'rings', keep, pad: 20 * U, clip: { x: W * 0.62, y: 0, w: W * 0.38, h: H }, picture: pic, rect: pic ? placePicture(pic, { x: W * 0.62, y: H * 0.2, w: W * 0.36, h: H * 0.7 }, 92) : undefined });
			drawLogo(ctx, LOGO.x, LOGO.y, LOGO.h, p.mark, p.ink);
			drawFitted(ctx, t, M * 2, top);
			for (const { g, x, y } of placed) {
				dotIcon(ctx, g.lines.join(' '), x, y + size * 0.6, size * 0.8, p.fill);
				drawFitted(ctx, g, x + 70, y);
			}
			break;
		}
		case 'stat':
		case 'image': {
			const template = type === 'stat' ? 'customer' : 'social';
			const d = { ...designFor(template, 'custom', { w: W, h: H }), palette: p.name, headline: slots.title ?? '' };
			if (type === 'stat') Object.assign(d, { stat: slots.stat ?? '', partnerName: '' });
			// The announcement's 176 px headline at this size is for a word or two; a slide title is a sentence.
			else Object.assign(d, { body: slots.body ?? '', image: pic ? 'picture' : 'none', textSize: 96, textY: 0.13, logo: true });
			// drawDesign sets its own scale from the canvas width, so it is handed the surface's.
			const k = ctx.getTransform().a;
			const fake = { width: W * k, height: H * k, getContext: () => ctx };
			drawDesign(fake as never, d, type === 'image' ? pic : null, fonts);
			break;
		}
		case 'quote': {
			const q = fit(ctx, slots.quote!, { family: fonts.sans, weight: 400, size: 76, tracking: -0.025, leading: 1.16, color: p.ink }, W * 0.76, 5, 0.5, 'quote');
			const markSize = 220;
			const a = slots.attribution ? fit(ctx, slots.attribution, { family: fonts.data, weight: 900, size: 34, tracking: 0.08, leading: 1.2, color: tokenColor('text-muted'), caps: true }, W * 0.76, 1, 0.6, 'attribution') : undefined;
			const blockH = 110 + q.height + (a ? 64 + a.height : 0);
			const top = Math.max(LOGO.y + LOGO.h + 60, (H - blockH) / 2);
			const x = W * 0.12;
			const keep: Rect[] = [LOGO, { x, y: top, w: Math.max(q.width, a?.width ?? 0), h: blockH }];
			drawDotField(ctx, { width: W, height: H, dot: 6, gap: 10, colors: p, field: 'rings', keep, pad: 24 * U, mask: (px, py) => (px / W + py / H > 1.45 ? 1 : 0) });
			drawLogo(ctx, LOGO.x, LOGO.y, LOGO.h, p.mark, p.ink);
			setFont(ctx, { family: fonts.sans, weight: 500, size: markSize });
			ctx.fillStyle = p.text;
			ctx.fillText('“', x - 8, top + markSize * 0.72);
			drawFitted(ctx, q, x, top + 110);
			if (a) drawFitted(ctx, a, x, top + 110 + q.height + 64);
			break;
		}
		case 'closing': {
			const lh = 112;
			const lw = logoRatio() * lh;
			const t = slots.title ? fit(ctx, slots.title, { ...head(56), color: p.ink, align: 'center' }, W * 0.7, 2, 0.6, 'title') : undefined;
			const blockH = lh + (t ? 48 + t.height : 0);
			const top = (H - blockH) / 2 - 20;
			const url = slots.url ? fit(ctx, slots.url, { family: fonts.data, weight: 900, size: 32, tracking: 0.08, leading: 1.2, color: p.ink, caps: true, align: 'center' }, W * 0.8, 1, 0.6, 'url') : undefined;
			const keep: Rect[] = [{ x: (W - lw) / 2, y: top, w: lw, h: lh }];
			if (t) keep.push({ x: (W - t.width) / 2, y: top + lh + 48, w: t.width, h: t.height });
			if (url) keep.push({ x: (W - url.width) / 2, y: H - 120, w: url.width, h: url.height });
			drawDotField(ctx, { width: W, height: H, dot: 7.2, gap: 40.8, colors: p, field: 'faint', keep, pad: 40 * U });
			drawLogo(ctx, (W - lw) / 2, top, lh, p.mark, p.ink);
			if (t) drawFitted(ctx, t, 0, top + lh + 48, W);
			if (url) drawFitted(ctx, url, 0, H - 120, W);
			break;
		}
	}
}

export type SlideRender = { png?: Buffer; svg?: string; rgb?: Buffer; width: number; height: number };

/** One slide as PNG (and the RGB pixels a PDF page wants) and SVG. */
export function renderSlide(slide: Slide, opts: { png?: boolean; svg?: boolean; scale?: number } = { png: true }): SlideRender {
	const out: SlideRender = { width: W * (opts.scale ?? 1), height: H * (opts.scale ?? 1) };
	if (opts.png !== false) {
		const s = surface(W, H, { scale: opts.scale ?? 1 });
		drawSlide(s.ctx, slide);
		out.png = toPng(s, { opaque: true });
		const px = pixelsOf(s).data;
		const rgb = Buffer.alloc((px.length / 4) * 3);
		for (let i = 0, j = 0; i < px.length; i += 4, j += 3) {
			rgb[j] = px[i]!;
			rgb[j + 1] = px[i + 1]!;
			rgb[j + 2] = px[i + 2]!;
		}
		out.rgb = rgb;
	}
	if (opts.svg) {
		const s = surface(W, H, { svg: true });
		drawSlide(s.ctx, slide);
		out.svg = toSvg(s);
	}
	return out;
}

export type { Palette };
