import { blockRects, platformOf, SMALL_FLOOR, type BlockInfo, type DesignDoc, type DrawnLayer, type LayerEdit, type Rect } from '../design/index.js';
import { brandFonts, tokenColor, type AnyCanvas, type Fonts } from './canvas.js';
import { drawBurst as burstAt, drawDotField } from './dots.js';
import { assertGlyphs } from './glyphs.js';
import { drawLogo, drawMark, logoClear, logoMin, logoRatio, markRatio } from './logo.js';
import { bodyFace, chipFace, designFor, dotIcon, dotText, drawBlock, drawDots, fitBlock, frameOf, grow, headFace, imageDoc, onFill, paletteOf, setBlock, setFace, union, type Block, type Can, type Face, type Pen } from './og.js';
import type { Picture } from './picture.js';

// The brand's blocks for compose designs: the share images' own parts (headline, body, chip, logo, mark, the dot shader,
// the burst, the dot field, the white card, the stat in dots, the quote, the dot-glyph list, the pill button) drawn into
// any cells of the grid. Charts, the search bar, the divider and the glyph are not in the share-image editor; they are
// built only from its parts and the tokens (bars and rings in the palette's dots, labels in its ink), as brand/assets/
// image.json notes. Words fit their cells or the block fails saying what to shorten.

const TEXT: Can = { scale: [0.5, 1.6], hide: true, align: true };
const PART: Can = { scale: [0.5, 1.6], hide: true };

export const BLOCKS: BlockInfo[] = [
	{ type: 'headline', names: ['title', 'heading'], kind: 'text', description: 'The headline in the brand sans at 500.', copy: [{ id: 'text', required: true }], span: { cols: 12, rows: 3 }, place: 'top' },
	{ type: 'body', names: ['subtitle', 'text', 'paragraph'], kind: 'text', description: 'A line or a paragraph.', copy: [{ id: 'text', required: true }], span: { cols: 8, rows: 2 } },
	{ type: 'badge', names: ['eyebrow', 'chip', 'tag', 'label'], kind: 'text', description: 'A short label in Doto capitals on a pill.', copy: [{ id: 'text', required: true }], span: { cols: 3, rows: 1 }, place: 'top-left' },
	{ type: 'logo', names: ['wordmark', 'lockup'], kind: 'logo', description: 'The logo, mark and wordmark.', copy: [], span: { cols: 4, rows: 1 }, place: 'top-left' },
	{ type: 'mark', names: ['logomark', 'symbol'], kind: 'logo', description: 'The mark alone.', copy: [], span: { cols: 3, rows: 3 }, place: 'center' },
	{ type: 'picture', names: ['image', 'photo', 'globe', 'art'], kind: 'art', description: 'Any picture through the dot shader (a built-in one when none is given), placed whole.', copy: [], image: { values: ['sample:Globe', 'sample:Sphere', 'sample:Cursor', 'sample:Layers', 'sample:Key'] }, span: { cols: 6, rows: 8 }, place: 'right' },
	{ type: 'burst', names: ['rays'], kind: 'art', description: 'The customer story\'s burst of dots.', copy: [], span: { cols: 6, rows: 6 }, place: 'bottom-right', under: true },
	{ type: 'field', names: ['dots', 'pattern', 'grid'], kind: 'art', description: 'The faint dot grid.', copy: [], options: [{ id: 'style', values: ['faint', 'rings'] }], span: { cols: 12, rows: 12 }, place: 'center', under: true },
	{ type: 'card', names: ['feature'], kind: 'panel', description: 'A white card with a numbered heading and a few lines, as on the cards post.', copy: [{ id: 'heading', required: true }, { id: 'text' }, { id: 'number' }], sample: { heading: 'Web extraction', text: 'Any page as markdown.', number: '1' }, span: { cols: 6, rows: 3 } },
	{ type: 'stat', names: ['number', 'metric'], kind: 'text', description: 'A big number set in dots, with a line under it.', copy: [{ id: 'value', required: true }, { id: 'label' }], sample: { value: '42%', label: 'less time on setup' }, span: { cols: 6, rows: 4 } },
	{ type: 'quote', names: ['testimonial'], kind: 'text', description: 'A quote with the open quote mark and who said it in Doto capitals.', copy: [{ id: 'text', required: true }, { id: 'attribution' }], sample: { text: 'It just works.', attribution: 'Head of growth, Acme' }, span: { cols: 10, rows: 5 } },
	{ type: 'list', names: ['bullets', 'points'], kind: 'text', description: 'Points with | between, each with its dot glyph.', copy: [{ id: 'items', required: true }], sample: { items: 'Scrape any page | Crawl a site | Search the web' }, span: { cols: 6, rows: 5 } },
	{ type: 'button', names: ['cta'], kind: 'text', description: 'A pill button in the palette\'s dots color.', copy: [{ id: 'text', required: true }], span: { cols: 3, rows: 1 }, place: 'bottom-left' },
	{ type: 'search', names: ['search-bar', 'input'], kind: 'text', description: 'A search field with the words in it (built from tokens: white pill, hairline, muted words).', copy: [{ id: 'text', required: true }], span: { cols: 8, rows: 1 }, place: 'center' },
	{ type: 'chart', names: ['graph'], kind: 'text', description: 'A bar, line or donut chart from "label value | label value" (built from tokens: the palette\'s dots and ink).', copy: [{ id: 'data', required: true }, { id: 'title' }], sample: { data: 'Scrape 42 | Crawl 31 | Search 27', title: 'Calls by kind' }, options: [{ id: 'kind', values: ['bar', 'line', 'donut'] }], span: { cols: 6, rows: 6 } },
	{ type: 'divider', names: ['rule', 'line'], kind: 'art', description: 'A hairline across its cells.', copy: [], span: { cols: 12, rows: 1 }, place: 'center' },
	{ type: 'icon', names: ['glyph'], kind: 'key', description: 'A 3 by 3 dot glyph, as the products list uses; its number picks which.', copy: [], options: [{ id: 'number', range: [0, 511] }], span: { cols: 1, rows: 1 } },
];

const info = (type: string) => BLOCKS.find((b) => b.type === type)!;

/** Draws a compose design and reports one layer per block (more for its parts, `<id>-<part>`). */
export function drawCompose(canvas: AnyCanvas, doc: DesignDoc, pictures: Record<string, Picture | null>, fonts: Fonts = brandFonts()): DrawnLayer[] {
	const W = doc.size.width;
	const H = doc.size.height;
	const d = { ...designFor('banner', doc.size.id === 'custom' || !imageDoc().sizes[doc.size.id] ? 'custom' : doc.size.id, { w: W, h: H }), palette: doc.theme ?? 'Paper', seed: doc.seed ?? 1 };
	const p = paletteOf(d);
	const ctx = canvas.getContext('2d');
	const s = canvas.width / W;
	const f = frameOf(d);
	const u = f.u ?? Math.sqrt(W * H) / 900;
	const floor = (SMALL_FLOOR * W) / platformOf(doc.size.id, W, H).shown;
	const layers: DrawnLayer[] = [];
	const q: Pen = { ctx, d, W, H, S: { x: 0, y: 0, w: W, h: H }, cuts: [], u, m: 32 * u, floor, p, fonts, edits: doc.layers, layers, can: {}, keep: [] };
	ctx.setTransform(s, 0, 0, s, 0, 0);
	ctx.fillStyle = p.bg;
	ctx.fillRect(0, 0, W, H);
	ctx.textBaseline = 'alphabetic';
	const placed = blockRects(doc).filter((b) => !doc.layers[b.block.id]?.hidden);
	const words = (id: string, slot: string) => doc.copy[`${id}.${slot}`]?.trim() ?? '';
	// Words of every block are measured first, so art drawn underneath keeps clear of them.
	const solid = placed.filter((b) => info(b.block.type).kind !== 'art');
	q.keep = solid.map((b) => grow(b.rect, b.block.type === 'logo' || b.block.type === 'mark' ? Math.max(8, logoClear(Math.min(b.rect.h, 48 * u))) : 8));
	const e = (id: string): LayerEdit => doc.layers[id] ?? {};
	const tooLong = (id: string) => new Error(`The ${id} is too long for its cells. Shorten it, or give it more cells (make it wider or taller).`);
	/** Words fitted to a rect: the block's own size first, down to the floor; a scale edit must fit as it is. */
	const fit = (id: string, text: string, face: Face, from: number, r: Rect, least = floor) => {
		assertGlyphs(id, face.caps ? text.toUpperCase() : text, face.data ? 'data' : 'sans');
		const k = e(id).scale ?? 1;
		const b = fitBlock(ctx, text, face, from, Math.max(least, floor), r.w, r.h);
		if (!b) throw tooLong(id);
		if (k === 1) return b;
		const scaled = setBlock(ctx, text, face, b.size * k, r.w);
		if (scaled.w > r.w + 0.5 || scaled.h > r.h + 0.5 || scaled.size < floor - 0.01) throw tooLong(`${id} at that size`);
		return scaled;
	};
	const put = (id: string, b: Block, r: Rect, align: 'left' | 'center' | 'right', color: string, ground = p.bg, extra: Partial<DrawnLayer> = {}, top = r.y) => {
		const out = drawBlock(ctx, b, r.x, top, e(id).align ?? align, r.w, color);
		layers.push({ id, kind: 'text', box: out.box, ink: out.ink, text: { asked: b.asked, drawn: b.lines.join('\n'), size: b.size, color, ground: [ground] }, can: TEXT, ...extra });
		return out.box;
	};

	for (const { block, rect: r } of placed) {
		const id = block.id;
		switch (block.type) {
			case 'field': {
				const style = doc.options[`${id}.style`] === 'rings' ? 'rings' : 'faint';
				const ink: Rect[] = [];
				drawDotField(ctx, { width: W, height: H, dot: 6, gap: 8, colors: p, field: style, clip: r, keep: q.keep, pad: 0, ink });
				layers.push({ id, kind: 'art', box: r, ink, can: PART });
				break;
			}
			case 'burst': {
				const ink: Rect[] = [];
				const R = (Math.min(r.w, r.h) / 2 / 0.78) * (e(id).scale ?? 1);
				burstAt(ctx, { width: W, height: H, cx: r.x + r.w / 2, cy: r.y + r.h / 2, R, fill: p.fill, ring: p.ring, keep: q.keep, pad: 0, ink, turn: (((doc.seed ?? 1) - 1) * 0.618) % 1 });
				layers.push({ id, kind: 'art', box: union(ink.length ? ink : [r]), ink, can: PART });
				break;
			}
			case 'picture': {
				const pic = pictures[id] ?? null;
				if (!pic) break;
				Object.assign(d, { field: 'none', dot: 7.6, gap: 3.8, imgX: undefined, imgY: undefined, imgScale: undefined });
				q.can = { [id]: PART };
				drawDots(q, pic, r, { id });
				break;
			}
			case 'divider': {
				const h = Math.max(1, u);
				const y = r.y + r.h / 2 - h / 2;
				ctx.fillStyle = p.field;
				ctx.globalAlpha = 0.5;
				ctx.fillRect(r.x, y, r.w, h);
				ctx.globalAlpha = 1;
				layers.push({ id, kind: 'art', box: { x: r.x, y, w: r.w, h }, can: PART });
				break;
			}
			case 'logo': {
				const least = logoMin(W, platformOf(doc.size.id, W, H).shown);
				// Never under the logo's least height: it may stand a little taller than one short row.
				// Its clear space fits in its own cells, so blocks around it keep clear.
				const h = Math.max(least, Math.min(r.h / (1 + 2 * logoClear(1)), r.w / logoRatio(), 48 * u)) * (e(id).scale ?? 1);
				const w = logoRatio() * h;
				if (w > r.w + 1) throw new Error(`The ${id} needs more cells: at least ${Math.ceil(w)} px wide here. Make it wider (too long for its cells as it is).`);
				const box = { x: r.x, y: r.y + (r.h - h) / 2, w, h };
				drawLogo(ctx, box.x, box.y, h, p.mark, p.ink);
				layers.push({ id, kind: 'logo', box, logo: { clear: logoClear(h), min: logoMin(W, platformOf(doc.size.id, W, H).shown) }, can: PART });
				break;
			}
			case 'mark': {
				const h = Math.min(r.h, r.w / markRatio()) * 0.8 * (e(id).scale ?? 1);
				const box = { x: r.x + (r.w - h * markRatio()) / 2, y: r.y + (r.h - h) / 2, w: h * markRatio(), h };
				drawMark(ctx, box.x, box.y, h, p.mark === p.bg ? p.ink : p.mark);
				layers.push({ id, kind: 'logo', box, logo: { clear: logoClear(h), min: logoMin(W, platformOf(doc.size.id, W, H).shown) }, can: PART });
				break;
			}
			case 'headline': {
				const b = fit(id, words(id, 'text'), headFace(fonts), Math.min(r.h, 110 * u), r, floor * 1.15);
				put(id, b, r, 'left', p.text);
				break;
			}
			case 'body': {
				const b = fit(id, words(id, 'text'), bodyFace(fonts), Math.max(floor, Math.min(32 * u, r.h)), r);
				put(id, b, r, 'left', p.ink);
				break;
			}
			case 'badge': {
				const text = words(id, 'text');
				const b = fit(id, text, chipFace(fonts), Math.max(floor, Math.min(14 * u, r.h * 0.5)), { ...r, w: r.w * 0.86, h: r.h / 1.9 });
				const bw = b.w + b.size * 1.8;
				const bh = b.size * 1.9;
				const box = { x: r.x, y: r.y + (r.h - bh) / 2, w: bw, h: bh };
				ctx.fillStyle = p.fill;
				ctx.beginPath();
				ctx.roundRect(box.x, box.y, bw, bh, bh / 2);
				ctx.fill();
				const ink = onFill(p);
				drawBlock(ctx, b, box.x + b.size * 0.94, box.y + (bh - b.h) / 2, 'left', b.w, ink);
				layers.push({ id, kind: 'text', box, ink: [box], text: { asked: text, drawn: b.lines.join('\n'), size: b.size, color: ink, ground: [p.fill] }, can: PART });
				break;
			}
			case 'button': {
				const text = words(id, 'text');
				const fs = Math.max(floor, Math.min(18 * u, r.h / 2.7));
				const b = fit(id, text, { family: fonts.sans, weight: 500, tracking: 0, leading: 1.2 }, fs, { ...r, w: r.w - fs * 2.6, h: r.h / 2.6 });
				const bw = b.w + b.size * 2.6;
				const bh = b.size * 2.6;
				const box = { x: r.x, y: r.y + (r.h - bh) / 2, w: bw, h: bh };
				ctx.fillStyle = p.fill;
				ctx.beginPath();
				ctx.roundRect(box.x, box.y, bw, bh, bh / 2);
				ctx.fill();
				const ink = onFill(p);
				drawBlock(ctx, b, box.x + b.size * 1.3, box.y + (bh - b.h) / 2, 'left', b.w, ink);
				layers.push({ id, kind: 'text', box, ink: [box], text: { asked: text, drawn: b.lines.join(' '), size: b.size, color: ink, ground: [p.fill] }, can: PART });
				break;
			}
			case 'search': {
				const text = words(id, 'text');
				const fs = Math.max(floor, Math.min(20 * u, r.h * 0.4));
				const white = tokenColor('white');
				const muted = tokenColor('text-muted');
				const b = fit(id, text, { family: fonts.sans, weight: 400, tracking: 0, leading: 1.2 }, fs, { ...r, w: r.w - fs * 4, h: r.h * 0.7 });
				const bh = Math.min(r.h, b.size * 2.8);
				const box = { x: r.x, y: r.y + (r.h - bh) / 2, w: r.w, h: bh };
				ctx.fillStyle = white;
				ctx.beginPath();
				ctx.roundRect(box.x, box.y, box.w, bh, bh / 2);
				ctx.fill();
				ctx.strokeStyle = tokenColor('border-hairline');
				ctx.lineWidth = Math.max(1, u);
				ctx.stroke();
				// The magnifier as dots: a ring and a handle.
				const cx = box.x + bh * 0.55;
				const cy = box.y + bh / 2;
				ctx.strokeStyle = muted;
				ctx.lineWidth = Math.max(1.5, b.size * 0.1);
				ctx.beginPath();
				ctx.arc(cx, cy - b.size * 0.08, b.size * 0.32, 0, Math.PI * 2);
				ctx.moveTo(cx + b.size * 0.24, cy + b.size * 0.16);
				ctx.lineTo(cx + b.size * 0.46, cy + b.size * 0.38);
				ctx.stroke();
				drawBlock(ctx, b, box.x + bh * 1.05, box.y + (bh - b.h) / 2, 'left', b.w, muted);
				layers.push({ id, kind: 'text', box, ink: [box], text: { asked: text, drawn: b.lines.join(' '), size: b.size, color: muted, ground: [white] }, can: PART });
				break;
			}
			case 'stat': {
				const value = words(id, 'value');
				const label = words(id, 'label');
				assertGlyphs(id, value);
				const k = e(id).scale ?? 1;
				const size0 = Math.min(r.h * (label ? 0.62 : 0.95), 240 * u) * k;
				setFace(ctx, { ...headFace(fonts), weight: 700, tracking: 0.03 }, size0);
				const vw0 = ctx.measureText(value).width;
				ctx.letterSpacing = '0px';
				const size = vw0 > r.w ? (size0 * r.w) / vw0 : size0;
				const vw = (vw0 * size) / size0;
				if (size < floor * 1.5) throw tooLong(id);
				const vh = size * 0.86;
				const lb = label ? fit(`${id}-label`, label, bodyFace(fonts), Math.max(floor, size * 0.24), { ...r, h: r.h - vh - size * 0.1 }) : undefined;
				const top = r.y + (r.h - vh - (lb ? size * 0.1 + lb.h : 0)) / 2;
				ctx.fillStyle = p.text;
				dotText(ctx, value, r.x, top, size, vh, fonts.sans);
				const vbox = { x: r.x, y: top + size * 0.06, w: Math.min(vw, r.w), h: size * 0.78 };
				layers.push({ id, kind: 'text', box: vbox, ink: [vbox], text: { asked: value, drawn: value, size, color: p.text, ground: [p.bg], bold: true }, can: PART });
				if (lb) put(`${id}-label`, lb, r, 'left', p.ink, p.bg, { can: {} }, top + vh + size * 0.1);
				break;
			}
			case 'quote': {
				const text = words(id, 'text');
				const who = words(id, 'attribution');
				const markH = Math.min(r.h * 0.22, 140 * u);
				const a = who ? fit(`${id}-attribution`, who, chipFace(fonts), Math.max(floor, 18 * u), { ...r, h: r.h * 0.2 }) : undefined;
				const b = fit(id, text, { family: fonts.sans, weight: 400, tracking: -0.02, leading: 1.2 }, Math.min(64 * u, r.h * 0.3), { ...r, h: r.h - markH - (a ? a.h + 24 * u : 0) });
				setFace(ctx, headFace(fonts), markH * 1.6);
				ctx.fillStyle = p.text;
				ctx.fillText('“', r.x - markH * 0.05, r.y + markH * 1.1);
				const qb = put(id, b, r, 'left', p.ink, p.bg, {}, r.y + markH);
				layers.push({ id: `${id}-mark`, kind: 'art', box: { x: r.x, y: r.y, w: markH, h: markH * 0.9 }, can: {} });
				if (a) put(`${id}-attribution`, a, r, 'left', p.ink, p.bg, { can: {} }, qb.y + qb.h + 24 * u);
				break;
			}
			case 'list': {
				const items = words(id, 'items').split('|').map((x) => x.trim()).filter(Boolean);
				for (const it of items) assertGlyphs(id, it);
				const k = e(id).scale ?? 1;
				let fs = Math.min(32 * u, r.h / (items.length * 1.7)) * k;
				let fitted: Block[] = [];
				for (; fs >= floor - 0.01; fs *= 0.95) {
					fitted = items.map((it) => setBlock(ctx, it, bodyFace(fonts), fs, r.w - fs * 1.7));
					const h = fitted.reduce((n, b) => n + b.h, 0) + fs * 0.5 * (items.length - 1);
					if (fitted.every((b) => b.w <= r.w - fs * 1.7 + 0.5) && h <= r.h + 0.5) break;
				}
				if (fs < floor - 0.01) throw tooLong(id);
				let y = r.y;
				const ink: Rect[] = [];
				for (const b of fitted) {
					dotIcon(ctx, b.asked, r.x, y + (b.size * b.face.leading) / 2, b.size * 0.8, p.fill);
					ink.push(...drawBlock(ctx, b, r.x + fs * 1.7, y, 'left', b.w, p.ink).ink);
					y += b.h + fs * 0.5;
				}
				layers.push({ id, kind: 'text', box: union(ink), ink, text: { asked: items.join('\n'), drawn: fitted.flatMap((b) => b.lines).join('\n'), size: fs, color: p.ink, ground: [p.bg] }, can: PART });
				break;
			}
			case 'card': {
				const cs = imageDoc().cards;
				const fill = tokenColor(cs.fill);
				const rad = Math.min(cs.radius * u, r.h / 4);
				ctx.save();
				ctx.shadowColor = cs.shadow.color;
				ctx.shadowBlur = cs.shadow.blur * u;
				ctx.shadowOffsetY = cs.shadow.y * u;
				ctx.fillStyle = fill;
				ctx.beginPath();
				ctx.roundRect(r.x, r.y, r.w, r.h, rad);
				ctx.fill();
				ctx.restore();
				layers.push({ id, kind: 'panel', box: r, can: PART });
				const pad = Math.min(28 * u, r.h * 0.18, r.w * 0.08);
				const inner = grow(r, -pad);
				const n = words(id, 'number');
				const badge = n ? Math.max(13 * u, floor / 1.15) : 0;
				const heading = fit(`${id}-heading`, words(id, 'heading'), { family: fonts.sans, weight: 500, tracking: -0.01, leading: 1.2 }, Math.max(floor, 26 * u), { ...inner, w: inner.w - (n ? badge * 2 + 14 * u : 0), h: inner.h * 0.5 });
				const tx = inner.x + (n ? badge * 2 + 14 * u : 0);
				if (n) {
					ctx.fillStyle = tokenColor(cs.badge);
					ctx.beginPath();
					ctx.arc(inner.x + badge, inner.y + (heading.size * heading.face.leading) / 2, badge, 0, Math.PI * 2);
					ctx.fill();
					const nb = setBlock(ctx, n, { family: fonts.sans, weight: 500, tracking: 0, leading: 1 }, badge * 1.2, badge * 2);
					drawBlock(ctx, nb, inner.x + badge - nb.w / 2, inner.y + (heading.size * heading.face.leading) / 2 - nb.size / 2, 'left', nb.w, tokenColor(cs.badgeInk));
					layers.push({ id: `${id}-number`, kind: 'text', box: { x: inner.x, y: inner.y, w: badge * 2, h: badge * 2 }, over: [id], text: { asked: n, drawn: n, size: nb.size, color: tokenColor(cs.badgeInk), ground: [tokenColor(cs.badge)] }, can: {} });
				}
				const hb = drawBlock(ctx, heading, tx, inner.y, 'left', heading.w, tokenColor(cs.heading));
				layers.push({ id: `${id}-heading`, kind: 'text', box: hb.box, ink: hb.ink, over: [id], text: { asked: heading.asked, drawn: heading.lines.join('\n'), size: heading.size, color: tokenColor(cs.heading), ground: [fill] }, can: {} });
				const body = words(id, 'text');
				if (body) {
					const top = inner.y + Math.max(heading.h, badge * 2) + 12 * u;
					const bb = fit(`${id}-text`, body, { family: fonts.sans, weight: 400, tracking: 0, leading: 1.4 }, Math.max(floor, 19 * u), { ...inner, y: top, h: inner.y + inner.h - top });
					const out = drawBlock(ctx, bb, inner.x, top, 'left', bb.w, tokenColor(cs.body));
					layers.push({ id: `${id}-text`, kind: 'text', box: out.box, ink: out.ink, over: [id], text: { asked: body, drawn: bb.lines.join('\n'), size: bb.size, color: tokenColor(cs.body), ground: [fill] }, can: {} });
				}
				break;
			}
			case 'chart': {
				const data = words(id, 'data').split('|').map((x) => x.trim()).filter(Boolean).map((row) => {
					const m = /^(.*\S)\s+(-?\d+(?:\.\d+)?)%?$/.exec(row);
					if (!m) throw new Error(`The ${id}'s data is "label value" rows with | between; "${row}" has no value at its end.`);
					return { label: m[1]!, value: Number(m[2]), raw: row };
				});
				if (data.length < 2 || data.length > 12) throw new Error(`The ${id} takes 2 to 12 rows, not ${data.length}.`);
				const kind = String(doc.options[`${id}.kind`] ?? 'bar');
				const title = words(id, 'title');
				const fs = Math.max(floor, Math.min(18 * u, r.h / (data.length * 2.4)));
				const tb = title ? fit(`${id}-title`, title, { family: fonts.sans, weight: 500, tracking: -0.01, leading: 1.2 }, Math.max(floor, 26 * u), { ...r, h: r.h * 0.2 }) : undefined;
				const area = { ...r, y: r.y + (tb ? tb.h + 12 * u : 0), h: r.h - (tb ? tb.h + 12 * u : 0) };
				if (tb) put(`${id}-title`, tb, r, 'left', p.text, p.bg, { can: {} });
				const max = Math.max(...data.map((x) => x.value), 0);
				const face: Face = { family: fonts.sans, weight: 400, tracking: 0, leading: 1.2 };
				const ink: Rect[] = [];
				const drawn: string[] = [];
				const label = (text: string, x: number, y: number, align: 'left' | 'right' | 'center' = 'left', w = area.w) => {
					const b = setBlock(ctx, text, face, fs, w);
					if (b.w > w + 0.5) throw tooLong(id);
					const ax = align === 'right' ? x - b.w : align === 'center' ? x - b.w / 2 : x;
					ink.push(...drawBlock(ctx, b, ax, y, 'left', b.w, p.ink).ink);
					drawn.push(text);
					return b;
				};
				if (kind === 'bar') {
					setFace(ctx, face, fs);
					const lw = Math.min(area.w * 0.4, Math.max(...data.map((x) => ctx.measureText(x.label).width)));
					const vw = Math.max(...data.map((x) => ctx.measureText(String(x.value)).width));
					ctx.letterSpacing = '0px';
					const row = area.h / data.length;
					const bh = Math.min(row * 0.55, fs * 1.4);
					data.forEach((x, i) => {
						const y = area.y + i * row + (row - fs * 1.2) / 2;
						label(x.label, area.x, y, 'left', lw);
						const bx = area.x + lw + fs;
						const full = area.w - lw - vw - fs * 2;
						const w = max > 0 ? Math.max(0, (full * x.value) / max) : 0;
						ctx.fillStyle = p.fill;
						ctx.beginPath();
						ctx.roundRect(bx, area.y + i * row + (row - bh) / 2, Math.max(bh, w), bh, bh / 2);
						ctx.fill();
						label(String(x.value), bx + Math.max(bh, w) + fs * 0.5, y, 'left', vw + 2);
					});
				} else if (kind === 'line') {
					const plot = { x: area.x, y: area.y, w: area.w, h: area.h - fs * 2 };
					const pts = data.map((x, i) => ({ x: plot.x + (plot.w * i) / (data.length - 1), y: plot.y + plot.h - (max > 0 ? (plot.h * x.value) / max : 0) }));
					ctx.strokeStyle = p.fill;
					ctx.lineWidth = Math.max(2, 3 * u);
					ctx.beginPath();
					pts.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
					ctx.stroke();
					ctx.fillStyle = p.fill;
					for (const pt of pts) {
						ctx.beginPath();
						ctx.arc(pt.x, pt.y, Math.max(3, 5 * u), 0, Math.PI * 2);
						ctx.fill();
					}
					const slot = plot.w / data.length;
					data.forEach((x, i) => label(`${x.label} ${x.value}`, pts[i]!.x, plot.y + plot.h + fs * 0.5, i === 0 ? 'left' : i === data.length - 1 ? 'right' : 'center', slot * 1.9));
				} else {
					const total = data.reduce((n, x) => n + Math.max(0, x.value), 0) || 1;
					const R = Math.min(area.h / 2, area.w * 0.28);
					const cx = area.x + R;
					const cy = area.y + area.h / 2;
					let a = -Math.PI / 2;
					const shades = [1, 0.7, 0.45, 0.25];
					data.forEach((x, i) => {
						const b = a + (Math.PI * 2 * Math.max(0, x.value)) / total;
						ctx.strokeStyle = p.fill;
						ctx.globalAlpha = shades[i % shades.length]!;
						ctx.lineWidth = R * 0.34;
						ctx.beginPath();
						ctx.arc(cx, cy, R * 0.83, a, b);
						ctx.stroke();
						ctx.globalAlpha = 1;
						a = b;
					});
					const lx = cx + R + fs * 1.5;
					data.forEach((x, i) => {
						const y = area.y + (area.h - data.length * fs * 1.6) / 2 + i * fs * 1.6;
						ctx.fillStyle = p.fill;
						ctx.globalAlpha = shades[i % shades.length]!;
						ctx.beginPath();
						ctx.arc(lx + fs * 0.4, y + fs * 0.6, fs * 0.4, 0, Math.PI * 2);
						ctx.fill();
						ctx.globalAlpha = 1;
						label(`${x.label} ${x.value}`, lx + fs * 1.3, y, 'left', area.x + area.w - lx - fs * 1.3);
					});
				}
				layers.push({ id, kind: 'text', box: union(ink), ink, text: { asked: data.map((x) => `${x.label} ${x.value}`).join('\n'), drawn: drawn.join('\n'), size: fs, color: p.ink, ground: [p.bg] }, can: PART });
				break;
			}
			case 'icon': {
				const name = String(doc.options[`${id}.number`] ?? 0);
				const sz = Math.min(r.w, r.h) * (e(id).scale ?? 1);
				dotIcon(ctx, name, r.x + (r.w - sz) / 2, r.y + r.h / 2, sz, p.fill);
				layers.push({ id, kind: 'key', box: { x: r.x + (r.w - sz) / 2, y: r.y + (r.h - sz) / 2, w: sz, h: sz }, can: PART });
				break;
			}
		}
	}
	ctx.letterSpacing = '0px';
	ctx.globalAlpha = 1;
	return layers;
}

/** Each image template as blocks: the same words, laid out on the grid, so any of them can be the start of a compose design. */
export function recipeFor(template: string, size: string, copy: Record<string, string>) {
	const c = (id: string, slot: string, v?: string) => (v?.trim() ? { [`${id}.${slot}`]: v } : {});
	const at = (col: number, row: number, cols: number, rows: number) => ({ col, row, cols, rows });
	const tall = ['square', 'portrait', 'tall', 'story', 'avatar'].includes(size);
	const f = imageDoc().sizes[size];
	// Wide strips (headers, covers) get a grid of 12 by 6 and everything in one row.
	if (f && f.w / f.h > 2.2) return stripRecipe(template, copy);
	switch (template) {
		case 'banner':
			return {
				theme: 'Paper',
				blocks: [
					{ id: 'logo', type: 'logo', at: at(0, 0, 4, 1) },
					...(copy.badge ? [{ id: 'badge', type: 'badge', at: tall ? at(0, 2, 4, 1) : at(0, 3, 3, 1) }] : []),
					{ id: 'headline', type: 'headline', at: tall ? at(0, 3, 12, 3) : at(0, 4, 6, 4) },
					...(copy.body ? [{ id: 'body', type: 'body', at: tall ? at(0, 6, 10, 1) : at(0, 8, 6, 2) }] : []),
					{ id: 'picture', type: 'picture', at: tall ? at(1, 7, 10, 5) : at(7, 0, 5, 12) },
				],
				copy: { ...c('headline', 'text', copy.headline), ...c('body', 'text', copy.body), ...c('badge', 'text', copy.badge) },
			};
		case 'social':
			return {
				theme: 'Blue',
				blocks: [
					...(copy.badge ? [{ id: 'badge', type: 'badge', at: at(5, 0, 2, 1) }] : []),
					{ id: 'headline', type: 'headline', at: at(0, 1, 12, 4) },
					...(copy.body ? [{ id: 'body', type: 'body', at: at(1, 5, 10, 2) }] : []),
					{ id: 'picture', type: 'picture', at: at(2, 7, 8, 5) },
				],
				copy: { ...c('headline', 'text', copy.headline), ...c('body', 'text', copy.body), ...c('badge', 'text', copy.badge) },
				layers: { headline: { align: 'center' as const }, ...(copy.body ? { body: { align: 'center' as const } } : {}) },
			};
		case 'products':
			return {
				theme: 'Paper',
				blocks: tall
					? [{ id: 'logo', type: 'logo', at: at(4, 0, 4, 1) }, { id: 'headline', type: 'headline', at: at(0, 1, 12, 3) }, ...(copy.cta ? [{ id: 'button', type: 'button', at: at(3, 4, 6, 1) }] : []), { id: 'list', type: 'list', at: at(1, 6, 10, 6) }]
					: [{ id: 'logo', type: 'logo', at: at(0, 1, 4, 1) }, { id: 'headline', type: 'headline', at: at(0, 3, 5, 5) }, ...(copy.cta ? [{ id: 'button', type: 'button', at: at(0, 9, 5, 2) }] : []), { id: 'list', type: 'list', at: at(6, 0, 6, 12) }],
				copy: { ...c('headline', 'text', copy.headline), ...c('button', 'text', copy.cta), ...c('list', 'items', listItems(copy.lists)) },
			};
		case 'cards': {
			const cards = (copy.cards ?? '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).slice(0, 4);
			return {
				theme: 'Blue',
				blocks: [
					{ id: 'field', type: 'field', at: at(0, 0, 12, 12) },
					...(copy.headline ? [{ id: 'headline', type: 'headline', at: at(1, 0, 10, 2) }] : []),
					...cards.map((_, i) => ({ id: `card-${i + 1}`, type: 'card', at: tall ? at(0, 2 + i * 2, 12, 2) : at((i % 2) * 6, 3 + Math.floor(i / 2) * 3, 6, 3) })),
					{ id: 'logo', type: 'logo', at: at(0, 11, 3, 1) },
				],
				copy: { ...c('headline', 'text', copy.headline), ...Object.assign({}, ...cards.map((b, i) => {
					const [h, ...rest] = b.split('\n');
					return { ...c(`card-${i + 1}`, 'heading', h), ...c(`card-${i + 1}`, 'text', rest.join(' ')), [`card-${i + 1}.number`]: String(i + 1) };
				})) },
			};
		}
		case 'customer':
			return {
				theme: 'Blue',
				blocks: [
					{ id: 'logo', type: 'logo', at: at(0, 0, 4, 1) },
					...(copy['partner-name'] ? [{ id: 'partner', type: 'body', at: at(9, 0, 3, 1) }] : []),
					{ id: 'burst', type: 'burst', at: tall ? at(4, 6, 8, 6) : at(7, 1, 5, 11) },
					...(copy.stat ? [{ id: 'stat', type: 'stat', at: tall ? at(0, 2, 8, 2) : at(0, 2, 6, 3) }] : []),
					{ id: 'headline', type: 'headline', at: tall ? at(0, 4, 10, 3) : at(0, 5, 6, 5) },
				],
				copy: { ...c('headline', 'text', copy.headline), ...c('stat', 'value', copy.stat), ...c('partner', 'text', copy['partner-name']) },
			};
		case 'mark':
			return { theme: 'Paper', blocks: [{ id: 'mark', type: 'mark', at: at(3, 3, 6, 6) }], copy: {} };
		default:
			return undefined;
	}
}

/** A products list as points: group names lose their # and stay as points. */
const listItems = (lists?: string) => lists?.split('\n').map((l) => l.replace(/^#+\s*/, '').trim()).filter(Boolean).join(' | ');

function stripRecipe(template: string, copy: Record<string, string>) {
	const c = (id: string, slot: string, v?: string) => (v?.trim() ? { [`${id}.${slot}`]: v } : {});
	const at = (col: number, row: number, cols: number, rows: number) => ({ col, row, cols, rows });
	// The words start a third of the way in: headers cover their lower left with the profile picture.
	const grid = { cols: 12, rows: 6 };
	switch (template) {
		case 'banner':
		case 'social':
			return {
				grid,
				theme: template === 'banner' ? 'Paper' : 'Blue',
				blocks: [
					...(template === 'banner' ? [{ id: 'logo', type: 'logo', at: at(4, 0, 3, 1) }] : []),
					...(copy.badge ? [{ id: 'badge', type: 'badge', at: at(template === 'banner' ? 7 : 4, 0, 2, 1) }] : []),
					{ id: 'headline', type: 'headline', at: at(4, 1, 5, copy.body ? 3 : 4) },
					...(copy.body ? [{ id: 'body', type: 'body', at: at(4, 4, 5, 1) }] : []),
					{ id: 'picture', type: 'picture', at: at(9, 0, 3, 6) },
				],
				copy: { ...c('headline', 'text', copy.headline), ...c('body', 'text', copy.body), ...c('badge', 'text', copy.badge) },
			};
		case 'products':
			return { grid, theme: 'Paper', blocks: [{ id: 'logo', type: 'logo', at: at(4, 0, 3, 1) }, { id: 'headline', type: 'headline', at: at(4, 1, 4, 3) }, ...(copy.cta ? [{ id: 'button', type: 'button', at: at(4, 4, 4, 2) }] : []), { id: 'list', type: 'list', at: at(8, 0, 4, 6) }], copy: { ...c('headline', 'text', copy.headline), ...c('button', 'text', copy.cta), ...c('list', 'items', listItems(copy.lists)) } };
		case 'cards': {
			const cards = (copy.cards ?? '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).slice(0, 2);
			return {
				grid,
				theme: 'Blue',
				blocks: [{ id: 'field', type: 'field', at: at(4, 0, 8, 6) }, ...(copy.headline ? [{ id: 'headline', type: 'headline', at: at(4, 0, 8, 1) }] : []), ...cards.map((_, i) => ({ id: `card-${i + 1}`, type: 'card', at: at(4 + i * 4, 1, 4, 3) })), { id: 'logo', type: 'logo', at: at(4, 5, 3, 1) }],
				copy: { ...c('headline', 'text', copy.headline), ...Object.assign({}, ...cards.map((b, i) => {
					const [h, ...rest] = b.split('\n');
					return { ...c(`card-${i + 1}`, 'heading', h), ...c(`card-${i + 1}`, 'text', rest.join(' ')), [`card-${i + 1}.number`]: String(i + 1) };
				})) },
			};
		}
		case 'customer':
			return { grid, theme: 'Blue', blocks: [{ id: 'logo', type: 'logo', at: at(4, 0, 3, 1) }, ...(copy['partner-name'] ? [{ id: 'partner', type: 'body', at: at(7, 0, 2, 1) }] : []), { id: 'burst', type: 'burst', at: at(9, 0, 3, 6) }, ...(copy.stat ? [{ id: 'stat', type: 'stat', at: at(4, 1, 4, 2) }] : []), { id: 'headline', type: 'headline', at: at(4, 3, 5, 3) }], copy: { ...c('headline', 'text', copy.headline), ...c('stat', 'value', copy.stat), ...c('partner', 'text', copy['partner-name']) } };
		case 'mark':
			return { grid, theme: 'Paper', blocks: [{ id: 'mark', type: 'mark', at: at(4, 1, 4, 4) }], copy: {} };
		default:
			return undefined;
	}
}
