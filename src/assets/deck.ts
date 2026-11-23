import { readFileSync } from 'node:fs';
import { checkDesign, contrast, platformOf, SMALL_FLOOR, type DesignDoc, type DrawnLayer, type Finding, type LayerEdit, type Rect, type TemplateInfo } from '../design/index.js';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import { brandFonts, encoded, pixelsOf, surface, toPng, toSvg, tokenColor, type Ctx, type Fonts } from './canvas.js';
import { pick, unknown } from './io.js';
import { assertGlyphs } from './glyphs.js';
import { drawLogo, logoClear, logoMin, logoRatio } from './logo.js';
import { designFor, dotIcon, dotText, drawBlock, drawBurst, drawDots, fitBlock, grow, logoBox, paletteOf, palettes, putLogo, setBlock, setFace, union, type Block, type Can, type Design, type Face, type Palette, type Pen } from './og.js';
import { seededSample } from './image.js';
import { readPicture, type Picture } from './picture.js';
import { samplePicture, sampleNames } from './samples.js';

// Deck slides at 1920 by 1080 (brand/assets/deck.json): cover, section, statement, bullets, stat, quote, image and
// closing. Each is drawn from the share images' rules: the logo top left at their unit, the headline in the brand sans
// at 500 and -0.02em, a palette from image.json (tokens only), dots kept clear of the words, pictures through the dot
// shader. Only the words a slide is given are drawn, whole; slots left out are left out and the slide closes up. Every
// layer is reported as drawn, and layer edits (src/design) apply here.

export type SlideType = 'cover' | 'section' | 'statement' | 'bullets' | 'stat' | 'quote' | 'image' | 'closing';
type SlideDoc = { name: string; description: string; palette: string; slots: string[]; required: string[]; picture?: boolean; own?: Record<string, string>; sample: Record<string, string> };
type DeckDoc = { width: number; height: number; slides: Record<SlideType, SlideDoc> };

let doc: DeckDoc | undefined;
export const deckDoc = (): DeckDoc => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'deck.json'), 'utf8')) as DeckDoc);
export const slideTypes = () => Object.keys(deckDoc().slides) as SlideType[];

export type Slide = { type: string; palette?: string; picture?: Picture | null } & Record<string, unknown>;

const LOGO: Can = { anchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'], scale: [0.6, 1.8], hide: true };
const TITLE: Can = { move: true, scale: [0.5, 1.5], align: true };
const TEXT: Can = { move: true, scale: [0.6, 1.5] };
const ART: Can = { move: true, scale: [0.4, 1.6], hide: true };
export const SLIDE_CAN: Record<SlideType, Record<string, Can>> = {
	cover: { logo: LOGO, title: TITLE, body: TEXT, art: ART, field: {} },
	section: { logo: LOGO, number: { scale: [0.5, 1.3] }, title: TITLE, field: { hide: true } },
	statement: { logo: LOGO, title: TITLE, field: { hide: true } },
	bullets: { logo: LOGO, title: TITLE, items: { scale: [0.6, 1.3] }, icons: {}, art: ART, field: { hide: true } },
	stat: { logo: LOGO, stat: { scale: [0.6, 1.3] }, title: TITLE, art: ART, field: {} },
	quote: { logo: LOGO, mark: { hide: true }, quote: TITLE, attribution: { scale: [0.7, 1.4] }, field: { hide: true } },
	image: { logo: LOGO, title: TITLE, body: TEXT, art: ART, field: {} },
	closing: { logo: { scale: [0.6, 1.5] }, title: TITLE, url: { scale: [0.7, 1.4], hide: true }, field: { hide: true } },
};

export function deckCatalog() {
	const d = deckDoc();
	return {
		size: { width: d.width, height: d.height },
		slides: slideTypes().map((id) => ({ id, name: d.slides[id].name, description: d.slides[id].description, palette: d.slides[id].palette, slots: [...d.slides[id].slots, ...(d.slides[id].picture ? ['image'] : [])], required: d.slides[id].required, sample: d.slides[id].sample })),
		palettes: palettes().map((p) => p.name),
	};
}

/** The words a slide draws: what it was given, its own address, and its sample when asked. Unknown slots throw. */
export function slotsFor(type: SlideType, given: Record<string, unknown>, sample = false): Record<string, string> {
	const def = deckDoc().slides[type];
	const out: Record<string, string> = { ...def.own, ...(sample ? def.sample : {}) };
	for (const [k, v] of Object.entries(given)) {
		if (['type', 'palette', 'theme', 'picture', 'sample', ...(def.picture ? ['image'] : [])].includes(k) || v === undefined) continue;
		const slot = k === 'headline' && def.slots.includes('title') ? 'title' : k;
		if (!def.slots.includes(slot)) throw new Error(`A ${type} slide does not take "${k}". It takes ${[...def.slots, ...(def.picture ? ['image'] : [])].map((s) => `"${s}"`).join(', ')}.`);
		if (Array.isArray(v) && v.every((x) => typeof x === 'string')) out[slot] = v.join(' | ');
		else if (typeof v === 'string') out[slot] = v;
		else throw new Error(`A ${type} slide's "${k}" takes text.`);
	}
	for (const r of def.required) if (!out[r]?.trim()) throw new Error(`A ${type} slide needs "${r}". Nothing is made up for it; --sample fills in sample copy.`);
	return out;
}

const W = 1920;
const H = 1080;
const U = Math.sqrt(W * H) / 900;
const M = 32 * U;

type Pad = { q: Pen; slots: Record<string, string>; title: Face };
const color = (p: Palette, name: string) => (contrast(tokenColor(name), p.bg) >= 4.5 ? tokenColor(name) : p.ink);
const tooLong = (what: string) => new Error(`The ${what} is too long for this slide. Shorten it, or split it over two.`);

/** Text fitted to a slide, at its edited size. */
function fitted(s: Pad, id: string, slot: string, face: Face, from: number, least: number, maxW: number, maxH: number): Block {
	const value = s.slots[slot]!.trim();
	const b = fitBlock(s.q.ctx, value, face, from, Math.max(least, s.q.floor), maxW, maxH);
	if (!b) throw tooLong(slot);
	const k = s.q.edits[id]?.scale ?? 1;
	if (k === 1) return b;
	const e = setBlock(s.q.ctx, value, face, b.size * k, maxW);
	if (e.w > maxW + 0.5 || e.h > maxH + 0.5 || e.size < s.q.floor - 0.01) throw tooLong(`${slot} at that size`);
	return e;
}

const shift = (q: Pen, id: string) => ({ x: (q.edits[id]?.dx ?? 0) * W, y: (q.edits[id]?.dy ?? 0) * H });
/** The box a block takes when drawn. */
function boxOf(q: Pen, id: string, b: Block, x: number, top: number, w: number, align: 'left' | 'center' | 'right'): Rect {
	const a = q.edits[id]?.align ?? align;
	const d = shift(q, id);
	return { x: (a === 'center' ? x + (w - b.w) / 2 : a === 'right' ? x + w - b.w : x) + d.x, y: top + d.y, w: b.w, h: b.h };
}

function put(q: Pen, id: string, b: Block, x: number, top: number, w: number, align: 'left' | 'center' | 'right', ink: string, own = false) {
	const d = shift(q, id);
	const r = drawBlock(q.ctx, b, x + d.x, top + d.y, q.edits[id]?.align ?? align, w, ink);
	q.layers.push({ id, kind: 'text', box: r.box, ink: r.ink, text: { asked: b.asked, drawn: b.lines.join('\n'), size: b.size, color: ink, ground: [q.p.bg], ...(own ? { own } : {}) }, can: q.can[id] ?? {} });
}

/** Draws one slide on a 1920 by 1080 context, with its layer edits, and reports every layer. */
export function drawSlide(ctx: Ctx, slide: Slide, fonts: Fonts = brandFonts(), edits: Record<string, LayerEdit> = {}): DrawnLayer[] {
	const type = pick('slide type', slide.type, slideTypes());
	const slots = slotsFor(type, slide, slide.sample === true);
	const wanted = (slide.palette ?? slide.theme) as string | undefined;
	const p = paletteOf({ palette: wanted ? pick('theme', wanted, palettes().map((x) => x.name)) : deckDoc().slides[type].palette });
	const pic = edits.art?.hidden ? null : (slide.picture ?? null);
	for (const [k, v] of Object.entries(slots)) {
		const doto = k === 'attribution' || k === 'url';
		assertGlyphs(k, doto ? v.toUpperCase() : v, doto ? 'data' : 'sans');
	}
	const d: Design = { ...designFor('banner', 'custom', { w: W, h: H }), palette: p.name };
	const can = SLIDE_CAN[type];
	const q: Pen = { ctx, d, W, H, S: { x: 0, y: 0, w: W, h: H }, cuts: [], u: U, m: M, floor: (SMALL_FLOOR * W) / platformOf('slide', W, H).shown, p, fonts, edits, layers: [], can, keep: [] };
	const title: Face = { family: fonts.sans, weight: 500, tracking: -0.02, leading: 1.18 };
	const bodyF: Face = { family: fonts.sans, weight: 400, tracking: 0, leading: 1.42 };
	const data: Face = { family: fonts.data, weight: 900, tracking: 0.08, leading: 1.2, caps: true, data: true };
	const s: Pad = { q, slots, title };
	ctx.fillStyle = p.bg;
	ctx.fillRect(0, 0, W, H);
	ctx.textBaseline = 'alphabetic';
	ctx.textAlign = 'left';

	const logo = type === 'closing' ? undefined : logoBox(q, 'top-left');
	const clear = logo ? logoClear(logo.h) : 0;
	const atTop = logo && logo.y < H / 2;
	const top0 = atTop ? logo.y + logo.h + Math.max(clear, 40) : M;
	const foot = logo && !atTop ? logo.y - Math.max(clear, 40) : H - M;
	const keep = (pad: number, ...rs: (Rect | undefined)[]) => {
		q.keep = [...rs.filter((r): r is Rect => !!r).map((r) => grow(r, pad)), ...(logo ? [grow(logo, Math.max(clear, 16))] : [])];
	};
	const field = (mode: Design['field'], dot: number, gap: number, over: Parameters<typeof drawDots>[3] = {}, image: Picture | null = null, area?: Rect) => {
		Object.assign(d, { field: edits.field?.hidden ? 'none' : mode, dot, gap });
		drawDots(q, image, area, over);
	};
	/** A column of blocks, stacked: each block's own move stays its own. */
	const middle = (h: number, up = 0) => Math.max(top0, Math.min((H - h) / 2 - up, foot - h));

	switch (type) {
		case 'cover': {
			const t = fitted(s, 'title', 'title', { ...title, tracking: -0.03, leading: 1.06 }, 150, 64, W * 0.54, (foot - top0) * (slots.body ? 0.68 : 1));
			const b = slots.body?.trim() ? fitted(s, 'body', 'body', bodyF, 46, 28, W * 0.5, foot - top0 - t.h - 40) : undefined;
			const top = middle(t.h + (b ? 40 + b.h : 0), -20);
			const rt = boxOf(q, 'title', t, M, top, W * 0.54, 'left');
			const rb = b && boxOf(q, 'body', b, M, top + t.h + 40, W * 0.5, 'left');
			keep(16 * U, rt, rb);
			if (pic) field('none', 7.6, 3.8, {}, pic, { x: Math.max(rt.x + rt.w + 40, W * 0.54), y: M, w: W - M - Math.max(rt.x + rt.w + 40, W * 0.54), h: H - M * 2 });
			else drawBurst(q);
			putLogo(q, logo);
			put(q, 'title', t, M, top, W * 0.54, 'left', p.text);
			if (b) put(q, 'body', b, M, top + t.h + 40, W * 0.5, 'left', p.ink);
			break;
		}
		case 'section': {
			const n = slots.number?.trim() ?? '';
			const size = 230 * (edits.number?.scale ?? 1);
			setFace(ctx, { ...title, weight: 700, tracking: 0.03 }, size);
			const nw = n ? ctx.measureText(n).width : 0;
			ctx.letterSpacing = '0px';
			if (nw > W - M * 4) throw tooLong('number');
			const nh = n ? size * 0.86 : 0;
			const t = fitted(s, 'title', 'title', title, 120, 48, W * 0.72, foot - top0 - nh - 24);
			const x = M * 2;
			const top = middle(nh + (n ? 24 : 0) + t.h, -10);
			const tt = top + nh + (n ? 24 : 0);
			keep(24 * U, n ? { x, y: top, w: nw, h: nh } : undefined, boxOf(q, 'title', t, x, tt, W * 0.72, 'left'));
			field('rings', 6, 10);
			putLogo(q, logo);
			if (n) {
				ctx.fillStyle = p.text;
				dotText(ctx, n, x, top, size, nh, fonts.sans);
				q.layers.push({ id: 'number', kind: 'text', box: { x, y: top, w: nw, h: nh }, ink: [{ x, y: top + size * 0.06, w: nw, h: size * 0.78 }], text: { asked: n, drawn: n, size, color: p.text, ground: [p.bg] }, can: can.number! });
			}
			put(q, 'title', t, x, tt, W * 0.72, 'left', p.text);
			break;
		}
		case 'statement': {
			const t = fitted(s, 'title', 'title', { ...title, leading: 1.16 }, 96, 44, W * 0.72, foot - top0);
			const top = middle(t.h);
			keep(24 * U, boxOf(q, 'title', t, W * 0.14, top, W * 0.72, 'center'));
			// The reel's tagline: dots gather at the edges and thin out toward the words.
			field('faint', 8.8, 31.2, { field: p.fill, fieldOp: 1, mask: (x, y) => Math.max((Math.abs(x - W / 2) / (W / 2)) * 1.1, (Math.abs(y - H / 2) / (H / 2)) * 1.4) >= 0.725 });
			putLogo(q, logo);
			put(q, 'title', t, W * 0.14, top, W * 0.72, 'center', p.text);
			break;
		}
		case 'bullets': {
			const items = (slots.items ?? '').split('|').map((x) => x.trim()).filter(Boolean);
			if (items.length > 8) throw new Error(`A bullets slide holds up to 8 points and it was given ${items.length}, which is too many. Split it.`);
			const x = M * 2;
			const t = slots.title?.trim() ? fitted(s, 'title', 'title', title, 88, 44, W - x * 2, (foot - top0) * 0.34) : undefined;
			const top = top0 + 40;
			const listTop = top + (t ? t.h + 64 : 0);
			const set = (size: number) => {
				for (const cols of items.length > 4 ? [2, 1] : [1, 2]) {
					const colW = (W - x * 2 - (cols - 1) * 80) / cols - (cols === 1 && pic ? W * 0.3 : 0);
					const per = Math.ceil(items.length / cols);
					const inset = size * 1.5;
					const blocks = items.map((it) => setBlock(ctx, it, bodyF, size, colW - inset));
					if (blocks.some((b) => b.w > colW - inset + 0.5)) continue;
					const gap = size * 0.75;
					const hs = Array.from({ length: cols }, (_, c) => blocks.slice(c * per, (c + 1) * per).reduce((n, b) => n + b.h + gap, -gap));
					if (Math.max(...hs) > foot - listTop + 0.5) continue;
					const out: { b: Block; x: number; y: number }[] = [];
					blocks.forEach((b, i) => {
						const c = Math.floor(i / per);
						const before = blocks.slice(c * per, i).reduce((n, v) => n + v.h + gap, 0);
						out.push({ b, x: x + c * (colW + 80), y: listTop + before });
					});
					return { out, size, inset };
				}
				return undefined;
			};
			let list: ReturnType<typeof set>;
			for (let size = 46; !list && size >= 24; size *= 0.96) list = set(size);
			const k = edits.items?.scale ?? 1;
			if (list && k !== 1) list = set(list.size * k);
			if (!list || list.size < q.floor) throw tooLong(k !== 1 ? 'list at that size' : 'list');
			const words = list.out.map((o) => ({ x: o.x, y: o.y, w: list.inset + o.b.w, h: o.b.h }));
			keep(20 * U, ...words, t && boxOf(q, 'title', t, x, top, W - x * 2, 'left'));
			const right = { x: W * 0.62, y: 0, w: W * 0.38, h: H };
			// The grid on the right starts under any words that reach into it, so it keeps one straight edge.
			const reach = [...words, ...(t ? [boxOf(q, 'title', t, x, top, W - x * 2, 'left')] : [])].filter((r) => r.x + r.w > right.x - 60);
			const from = pic ? 0 : Math.max(0, ...reach.map((r) => r.y + r.h + 48));
			// Too little room left for the grid to read as one: none.
			field(from > H * 0.62 ? 'none' : 'rings', 6, 10, { mask: (px, py) => px > right.x && py > from }, pic, pic ? { x: W * 0.64, y: H * 0.3, w: W * 0.36 - M, h: H * 0.7 - M } : undefined);
			putLogo(q, logo);
			if (t) put(q, 'title', t, x, top, W - x * 2, 'left', p.text);
			const ink: Rect[] = [];
			const icons: Rect[] = [];
			for (const o of list.out) {
				const iy = o.y + (list.size * bodyF.leading) / 2;
				dotIcon(ctx, o.b.asked, o.x, iy, list.size * 0.8, p.fill);
				icons.push({ x: o.x, y: iy - list.size * 0.4, w: list.size * 0.8, h: list.size * 0.8 });
				ink.push(...drawBlock(ctx, o.b, o.x + list.inset, o.y, 'left', o.b.w, p.ink).ink);
			}
			q.layers.push({ id: 'items', kind: 'text', box: union(ink), ink, text: { asked: items.join('\n'), drawn: list.out.flatMap((o) => o.b.lines).join('\n'), size: list.size, color: p.ink, ground: [p.bg] }, can: can.items! });
			q.layers.push({ id: 'icons', kind: 'art', box: union(icons), ink: icons, can: {} });
			break;
		}
		case 'stat': {
			const st = slots.stat!.trim();
			const hf: Face = { ...title, tracking: -0.03, leading: 1.06 };
			const x = M * 1.4;
			const maxW = W * 0.56;
			const measure = (big: number, ks: number, kt: number) => {
				const size = big * 2 * ks;
				setFace(ctx, { ...title, weight: 700, tracking: 0.03 }, size);
				const w = ctx.measureText(st).width;
				ctx.letterSpacing = '0px';
				const b = slots.title?.trim() ? setBlock(ctx, slots.title.trim(), hf, big * kt, maxW) : undefined;
				const h = size * 0.86 + (b ? big * 0.12 + b.h : 0);
				return w > W - x * 2 || (b && b.w > maxW + 0.5) || h > foot - top0 ? undefined : { size, w, b, h, big };
			};
			let m: ReturnType<typeof measure>;
			for (let big = 160; !m && big >= 40; big *= 0.965) m = measure(big, 1, 1);
			if (m && (edits.stat?.scale || edits.title?.scale)) m = measure(m.big, edits.stat?.scale ?? 1, edits.title?.scale ?? 1);
			if (!m || (m.b && m.b.size < q.floor)) throw tooLong(slots.title ? 'title' : 'stat');
			const top = middle(m.h);
			const tt = top + m.size * 0.86 + m.big * 0.12;
			const rs = { x, y: top, w: m.w, h: m.size * 0.86 };
			keep(16 * U, rs, m.b && boxOf(q, 'title', m.b, x, tt, maxW, 'left'));
			drawBurst(q);
			putLogo(q, logo);
			ctx.fillStyle = p.text;
			dotText(ctx, st, x, top, m.size, m.size * 0.86, fonts.sans);
			q.layers.push({ id: 'stat', kind: 'text', box: rs, ink: [{ ...rs, y: top + m.size * 0.06, h: m.size * 0.78 }], text: { asked: st, drawn: st, size: m.size, color: p.text, ground: [p.bg] }, can: can.stat! });
			if (m.b) put(q, 'title', m.b, x, tt, maxW, 'left', p.text);
			break;
		}
		case 'quote': {
			const x = W * 0.12;
			const mark = edits.mark?.hidden ? 0 : 110;
			const a = slots.attribution?.trim() ? fitted(s, 'attribution', 'attribution', data, 34, 24, W * 0.76, 100) : undefined;
			const t = fitted(s, 'quote', 'quote', { family: fonts.sans, weight: 400, tracking: -0.025, leading: 1.18 }, 76, 36, W * 0.76, foot - top0 - mark - (a ? 64 + a.h : 0));
			const top = middle(mark + t.h + (a ? 64 + a.h : 0));
			const rt = boxOf(q, 'quote', t, x, top + mark, W * 0.76, 'left');
			const ra = a && boxOf(q, 'attribution', a, x, top + mark + t.h + 64, W * 0.76, 'left');
			const rm = mark ? { x: x - 8, y: top, w: 120, h: 90 } : undefined;
			keep(24 * U, rt, ra, rm);
			field('rings', 6, 10, { mask: (px, py) => px / W + py / H > 1.45 });
			putLogo(q, logo);
			if (rm) {
				setFace(ctx, { ...title, tracking: 0 }, 220);
				ctx.fillStyle = p.text;
				const g = ctx.measureText('“');
				ctx.fillText('“', x - 8, top + 220 * 0.72);
				q.layers.push({ id: 'mark', kind: 'art', box: { x: x - 8 - g.actualBoundingBoxLeft, y: top + 220 * 0.72 - g.actualBoundingBoxAscent, w: g.actualBoundingBoxRight + g.actualBoundingBoxLeft, h: g.actualBoundingBoxAscent + g.actualBoundingBoxDescent }, can: can.mark! });
			}
			put(q, 'quote', t, x, top + mark, W * 0.76, 'left', p.ink);
			if (a) put(q, 'attribution', a, x, top + mark + t.h + 64, W * 0.76, 'left', color(p, 'text-muted'));
			break;
		}
		case 'image': {
			const tall = foot - top0;
			const t = fitted(s, 'title', 'title', { family: fonts.sans, weight: 400, tracking: -0.01, leading: 1.1 }, 96, 44, W * 0.8, tall * (pic ? 0.34 : 0.7));
			const b = slots.body?.trim() ? fitted(s, 'body', 'body', bodyF, 36, 24, W * 0.7, tall * 0.2) : undefined;
			const h = t.h + (b ? 28 + b.h : 0);
			const top = pic ? top0 : middle(h);
			const rt = boxOf(q, 'title', t, W * 0.1, top, W * 0.8, 'center');
			const rb = b && boxOf(q, 'body', b, W * 0.15, top + t.h + 28, W * 0.7, 'center');
			keep(16 * U, rt, rb);
			const below = top + h + 48;
			if (pic) field('none', 7.6, 3.8, {}, pic, { x: M, y: below, w: W - M * 2, h: foot - below });
			putLogo(q, logo);
			put(q, 'title', t, W * 0.1, top, W * 0.8, 'center', p.text);
			if (b) put(q, 'body', b, W * 0.15, top + t.h + 28, W * 0.7, 'center', p.ink);
			break;
		}
		case 'closing': {
			const lh = 112 * (edits.logo?.scale ?? 1);
			const lw = logoRatio() * lh;
			const t = slots.title?.trim() ? fitted(s, 'title', 'title', title, 56, 32, W * 0.7, 260) : undefined;
			const u = slots.url?.trim() && !edits.url?.hidden ? fitted(s, 'url', 'url', data, 32, 24, W * 0.8, 60) : undefined;
			const gap = Math.max(48, logoClear(lh) * 1.15);
			const top = (H - (lh + (t ? gap + t.h : 0))) / 2 - 20;
			const lr = { x: (W - lw) / 2, y: top, w: lw, h: lh };
			const rt = t && boxOf(q, 'title', t, W * 0.15, top + lh + gap, W * 0.7, 'center');
			const ut = H - 120;
			q.keep = [grow(lr, Math.max(40 * U, logoClear(lh))), ...(rt ? [grow(rt, 40 * U)] : []), ...(u ? [grow(boxOf(q, 'url', u, W * 0.1, ut, W * 0.8, 'center'), 40 * U)] : [])];
			field('faint', 7.2, 40.8);
			drawLogo(ctx, lr.x, lr.y, lh, p.mark, p.ink);
			q.layers.push({ id: 'logo', kind: 'logo', box: lr, logo: { clear: logoClear(lh), min: logoMin(W, 960) }, can: can.logo! });
			if (t) put(q, 'title', t, W * 0.15, top + lh + gap, W * 0.7, 'center', p.ink);
			if (u) put(q, 'url', u, W * 0.1, ut, W * 0.8, 'center', p.ink, slots.url === deckDoc().slides.closing.own?.url);
			break;
		}
	}
	ctx.letterSpacing = '0px';
	ctx.globalAlpha = 1;
	return q.layers;
}

export type SlideRender = { png?: Buffer; svg?: string; rgb?: Buffer; jpg?: Buffer; webp?: Buffer; layers: DrawnLayer[]; width: number; height: number };

/** One slide as PNG (and the RGB pixels a PDF page wants), SVG, JPEG and WebP. */
export function renderSlide(slide: Slide, opts: { png?: boolean; svg?: boolean; jpg?: boolean; webp?: boolean; rgb?: boolean; scale?: number } = { png: true }, edits: Record<string, LayerEdit> = {}): SlideRender {
	const scale = opts.scale ?? 1;
	const out: SlideRender = { width: W * scale, height: H * scale, layers: [] };
	if (opts.png !== false || opts.jpg || opts.webp || opts.rgb || !opts.svg) {
		const s = surface(W, H, { scale });
		out.layers = drawSlide(s.ctx, slide, brandFonts(), edits);
		if (opts.png !== false) out.png = toPng(s, { opaque: true });
		if (opts.jpg) out.jpg = encoded(s, 'image/jpeg');
		if (opts.webp) out.webp = encoded(s, 'image/webp');
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
		const layers = drawSlide(s.ctx, slide, brandFonts(), edits);
		if (!out.layers.length) out.layers = layers;
		out.svg = toSvg(s);
	}
	return out;
}

/** The picture a slide draws: its own, or for the image slide with none, the built-in one. */
export async function slidePicture(base: string, type: string, value: unknown) {
	if (value === 'none') return null;
	if (typeof value !== 'string' || !value.trim()) return type === 'image' ? (samplePicture(seededSample(1)) ?? null) : null;
	if (value.toLowerCase().startsWith('sample:')) {
		const s = samplePicture(value);
		if (!s) throw unknown('sample picture', value.slice(7), sampleNames());
		return s;
	}
	return readPicture(base, value);
}

/** The slide a document stands for. */
export async function slideOf(doc: DesignDoc, dir: string): Promise<Slide> {
	return { type: doc.template, ...doc.copy, palette: doc.theme, picture: await slidePicture(dir, doc.template, doc.images.picture) };
}

/** What a slide takes, as the design core reads it. */
export function slideInfo(id: SlideType): TemplateInfo {
	const s = deckDoc().slides[id];
	return {
		id,
		kind: 'slide',
		description: s.description,
		sizes: ['slide'],
		themes: palettes().map((p) => p.name),
		copy: s.slots.map((c) => ({ id: c, ...(s.required.includes(c) ? { required: true } : {}) })),
		images: s.picture ? [{ id: 'picture', values: ['none', ...sampleNames().map((n) => `sample:${n}`)] }] : [],
		options: [],
		layers: Object.entries(SLIDE_CAN[id]).map(([layer, can]) => ({ id: layer, can })),
		grounds: Object.fromEntries(palettes().map((p) => [p.name, p.bg])),
		formats: ['png', 'svg', 'jpg', 'webp', 'pdf'],
		layouts: [s.name.toLowerCase(), `${id} slide`],
	};
}

/** Everything wrong with a drawn slide. `colors` are the ones words may use. */
export function checkSlide(slide: Slide, layers: DrawnLayer[], colors: () => string[], allow: string[] = []): Finding[] {
	const type = slide.type as SlideType;
	const own = deckDoc().slides[type].own ?? {};
	const copy = Object.fromEntries(Object.entries(slotsFor(type, slide, slide.sample === true)).filter(([k, v]) => v.trim() && own[k] !== v));
	const d = { version: 1, brand: brand().bin, kind: 'slide', template: type, size: { id: 'slide', width: W, height: H }, copy, images: {}, options: {}, layers: {}, allow, history: [], future: [] } as DesignDoc;
	return checkDesign({ doc: d, info: slideInfo(type), layers, adapter: { colors } });
}

export type { Palette };
