import { checkDesign, errorsOf, sizeAlias, type DesignDoc, type DrawnLayer, type Finding, type LayerEdit, type TemplateInfo } from '../design/index.js';
import { brand, colorHex } from '../lib/brand.js';
import { brandFonts, encoded, surface, toPng, toSvg } from './canvas.js';
import { pick, unknown } from './io.js';
import { CAN, clampDim, designFor, drawDesign, frameOf, imageDoc, onFill, paletteOf, palettes, TEMPLATES, type Design, type Field, type Template } from './og.js';
import { readPicture, type Picture } from './picture.js';
import { samplePicture, sampleNames } from './samples.js';
import type { Dither, Render } from './shader.js';

// Share images and social posts as an API: a request (template, size, copy, positions, shader settings) becomes a
// design, and a design becomes PNG, SVG, JPEG and WebP with the layers that were drawn. The `image` command and the
// `design` adapter are thin layers over this, so both draw the same bytes.

export const RENDERS: Render[] = ['toneEdges', 'tone', 'edges', 'silhouette'];
export const DITHERS: Dither[] = ['none', 'diffuse', 'pattern'];
export const FIELDS: Field[] = ['none', 'faint', 'rings'];
export type Kind = 'share' | 'social';

/** Every size id with its pixels and the other names it goes by. */
export function imageSizes(): { id: string; kinds: Kind[]; label: string; width: number; height: number; aliases: string[] }[] {
	const doc = imageDoc();
	return Object.entries(doc.sizes).map(([id, s]) => ({
		id,
		kinds: (['share', 'social'] as Kind[]).filter((k) => doc.kinds[k].sizes.includes(id)),
		label: s.label,
		width: s.w,
		height: s.h,
		aliases: Object.entries(doc.aliases).filter(([, to]) => to === id).map(([from]) => from),
	}));
}

/** A size as typed: an id, an older id (`s-4x5`), a ratio (`4:5`), a name people use (`twitter header`), or `custom`. */
export function sizeId(typed: string): string {
	const t = typed.trim().toLowerCase();
	if (t === 'custom') return 'custom';
	const hit = imageDoc().sizes[t] ? t : (imageDoc().aliases[t] ?? sharedSize(t));
	if (!hit) throw unknown('size', typed, [...imageSizes().map((s) => s.id), 'custom']);
	return hit;
}

function sharedSize(t: string): string | undefined {
	const id = sizeAlias(t);
	return id && imageDoc().sizes[id] ? id : undefined;
}

export type ImageRequest = {
	template: string;
	/** Picks the default size (`og` for share, `landscape` for social) when `size` is not given. */
	kind?: Kind;
	size?: string;
	/** For `custom`: 200 to 4000 each. */
	width?: number;
	height?: number;
	/** Anything a design holds, over the template's settings. */
	set?: Partial<Design>;
	/** Fill the copy that was not passed with the template's sample. */
	sample?: boolean;
};

/** The text slots each template draws (its flags). */
export function slotsOf(t: Template): string[] {
	switch (t) {
		case 'banner':
		case 'social':
			return ['headline', 'body', 'badge'];
		case 'products':
			return ['headline', 'cta', 'lists'];
		case 'cards':
			return ['headline', 'cards', 'footer'];
		case 'customer':
			return ['headline', 'stat', 'partner-name'];
		case 'mark':
			return [];
	}
}

/** Where a slot is kept on a design. */
export const slotKey = (slot: string) => (slot === 'partner-name' ? 'partnerName' : slot) as keyof Design;
const SLOTS = ['headline', 'body', 'badge', 'cta', 'lists', 'cards', 'footer', 'stat', 'partner-name'];

/** The design a request draws: the template's settings at the size, then the request's. Copy a template cannot draw,
 * or needs and was not given, is an error. */
export function designOf(req: ImageRequest): Design {
	const template = pick('template', req.template, TEMPLATES) as Template;
	const spec = imageDoc().templates[template];
	const kind = req.kind ? pick('kind', req.kind, ['share', 'social'] as const) : undefined;
	const size = req.size ? sizeId(req.size) : kind === 'social' && spec.sizes.includes('landscape') ? 'landscape' : spec.size;
	if (!spec.sizes.includes(size)) throw new Error(`The ${template} layout does not come in ${size}. It comes in ${spec.sizes.join(', ')}.${size === 'avatar' ? ' For a profile picture, use mark.' : ''}`);
	if (size === 'custom' && (!req.width || !req.height)) throw new Error('A custom size needs --width and --height (200 to 4000).');
	if (size !== 'custom' && (req.width || req.height)) throw new Error(`--width and --height go with --size custom, not ${size}.`);
	const dims = size === 'custom' ? { w: clampDim(req.width!), h: clampDim(req.height!) } : undefined;
	const set = stripUndefined(req.set ?? {});
	const takes = slotsOf(template);
	const sample = req.sample ? Object.fromEntries(Object.entries(spec.sample).filter(([k]) => !set[k as keyof Design])) : {};
	const d: Design = { ...designFor(template, size, dims), ...sample, ...set };
	if (d.palette) d.palette = pick('theme', d.palette, palettes().map((p) => p.name));
	for (const slot of SLOTS) if (!takes.includes(slot) && set[slotKey(slot)]) throw new Error(`The ${template} layout does not draw ${slot}, so "${String(set[slotKey(slot)])}" would be lost. It draws ${takes.join(', ') || 'no copy'}.`);
	for (const slot of spec.required) if (!String(d[slotKey(slot)] ?? '').trim()) throw new Error(`The ${template} layout needs --${slot}. Nothing is made up for it; --sample fills in sample copy.`);
	d.render = pick('render', d.render, RENDERS);
	d.dither = pick('dither', d.dither, DITHERS);
	d.field = pick('field', d.field, FIELDS);
	d.cutout = pick('cutout', d.cutout, ['auto', 'whole'] as const);
	if (!Number.isInteger(d.seed) || d.seed < 0) throw new Error(`--seed takes a whole number, 0 or more, not ${String(d.seed)}.`);
	return d;
}

function stripUndefined<T extends object>(o: T): Partial<T> {
	return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** The built-in picture a seed stands for (1 is the first). */
export const seededSample = (seed: number) => sampleNames()[(((seed || 1) - 1) % sampleNames().length + sampleNames().length) % sampleNames().length]!;

/** The picture a design draws: for the customer story, the customer's logo (`partner`, only when one is given);
 * otherwise the design's image (a path, `sample:<name>`, or `none`), or the seed's built-in picture. */
export async function pictureFor(d: Design, cwd: string, partner?: string): Promise<Picture | null> {
	if (partner && d.template !== 'customer') throw new Error(`The ${d.template} layout draws no customer logo. Use customer.`);
	if (partner && d.partnerName.trim()) throw new Error(`Pass the customer's logo or their name, not both ("${d.partnerName}" would not be drawn).`);
	if (d.template === 'customer' && d.image && d.image !== 'none') throw new Error('The customer layout draws no picture; its art is the burst. Pass --partner for the customer\'s logo.');
	if (d.template === 'customer') return partner ? readPicture(cwd, partner, 800) : null;
	if (d.template === 'cards' || d.template === 'mark') {
		if (d.image && d.image !== 'none') throw new Error(`The ${d.template} layout draws no picture.`);
		return null;
	}
	if (!d.image) return samplePicture(seededSample(d.seed)) ?? null;
	if (d.image === 'none') return null;
	if (d.image.toLowerCase().startsWith('sample:')) {
		const s = samplePicture(d.image);
		if (!s) throw unknown('sample picture', d.image.slice(7), sampleNames());
		return s;
	}
	return readPicture(cwd, d.image);
}

export type Rendered = { png?: Buffer; svg?: string; jpg?: Buffer; webp?: Buffer; layers: DrawnLayer[]; width: number; height: number };
export type RenderOptions = { png?: boolean; svg?: boolean; jpg?: boolean; webp?: boolean; scale?: number };

/** Draws a design with its layer edits. `scale` multiplies the pixels (the SVG is at the frame size). */
export function renderDesign(d: Design, picture: Picture | null, opts: RenderOptions = { png: true }, edits: Record<string, LayerEdit> = {}): Rendered {
	const L = frameOf(d);
	const scale = opts.scale ?? 1;
	const out: Rendered = { width: Math.round(L.w * scale), height: Math.round(L.h * scale), layers: [] };
	const raster = opts.png !== false || opts.jpg || opts.webp;
	if (raster || !opts.svg) {
		const s = surface(L.w, L.h, { scale });
		out.layers = drawDesign(s.canvas, d, picture, brandFonts(), edits).layers;
		if (opts.png !== false) out.png = toPng(s);
		if (opts.jpg) out.jpg = encoded(s, 'image/jpeg');
		if (opts.webp) out.webp = encoded(s, 'image/webp');
	}
	if (opts.svg) {
		const s = surface(L.w, L.h, { svg: true });
		const r = drawDesign(s.canvas, d, picture, brandFonts(), edits);
		if (!out.layers.length) out.layers = r.layers;
		out.svg = toSvg(s);
	}
	return out;
}

const tokenHex = (name: string) => colorHex(name)!.slice(0, 7);

/** Colors words may be drawn in and on: the palettes' tokens, the cards' and white. */
export function wordColors(): string[] {
	const c = imageDoc().cards;
	return [...new Set([...palettes().flatMap((p) => [p.bg, p.fill, p.text, p.ink, onFill(p)]), ...[c.fill, c.heading, c.body, c.badge, c.badgeInk, 'white', 'text-muted'].map(tokenHex)])];
}

/** Everything wrong with a drawn design, as `design check` finds it. */
export function checkImage(d: Design, layers: DrawnLayer[], png: Uint8Array | undefined, allow: string[] = []): Finding[] {
	const copy = Object.fromEntries(slotsOf(d.template).map((s) => [s, String(d[slotKey(s)] ?? '')] as const).filter(([s, v]) => v.trim() && !(s === 'footer' && v === imageDoc().base.footer)));
	const f = frameOf(d);
	const doc = { version: 1, brand: brand().bin, kind: 'image', template: d.template, size: { id: d.size, width: f.w, height: f.h }, theme: paletteOf(d).name, copy, images: {}, options: {}, layers: {}, allow, history: [], future: [] } as DesignDoc;
	return checkDesign({ doc, info: infoOf(d.template), layers, adapter: { colors: wordColors }, png });
}

export { errorsOf };

/** What a template takes, as the design core reads it. */
export function infoOf(id: Template): TemplateInfo {
	const t = imageDoc().templates[id];
	const pic = id === 'banner' || id === 'social' || id === 'products';
	const dots = id !== 'mark';
	return {
		id,
		kind: 'image',
		description: t.description,
		sizes: t.sizes,
		themes: palettes().map((p) => p.name),
		copy: slotsOf(id).map((s) => ({ id: s, ...(t.required.includes(s) ? { required: true } : {}) })),
		images: [...(pic ? [{ id: 'picture', values: ['none', ...sampleNames().map((n) => `sample:${n}`)] }] : []), ...(id === 'customer' ? [{ id: 'partner' }] : [])],
		options: [
			...(dots ? [{ id: 'dot', range: [2, 40] as [number, number], description: 'dot size in the image\'s pixels' }, { id: 'gap', range: [0, 40] as [number, number], description: 'gap between dots' }, { id: 'field', values: FIELDS as string[], description: 'the grid behind' }] : []),
			...(pic ? [{ id: 'render', values: RENDERS as string[] }, { id: 'fill', range: [0, 100] as [number, number], description: 'share of the picture\'s dots that are filled' }, { id: 'hollow', range: [0, 100] as [number, number], description: 'share that are rings' }, { id: 'dither', values: DITHERS as string[] }, { id: 'invert', values: ['true', 'false'] }, { id: 'cutout', values: ['auto', 'whole'] }, { id: 'key-tol', range: [0, 30] as [number, number] }] : []),
			...(id === 'customer' ? [{ id: 'burst', values: ['true', 'false'] }, { id: 'partner-color', values: ['true', 'false'], description: 'keep the logo\'s own colors' }] : []),
		],
		layers: Object.entries(CAN[id]).map(([layer, can]) => ({ id: layer, can })),
		grounds: Object.fromEntries(palettes().map((p) => [p.name, p.bg])),
		formats: ['png', 'svg', 'jpg', 'webp'],
		layouts: [t.label.toLowerCase()],
	};
}

/** What `manifest` and `image --list` say about the templates. */
export function imageCatalog() {
	const doc = imageDoc();
	return {
		kinds: Object.entries(doc.kinds).map(([id, k]) => ({ id, label: k.label, templates: k.templates, sizes: k.sizes, custom: k.custom })),
		templates: TEMPLATES.map((id) => {
			const t = doc.templates[id];
			return { id, name: t.label, description: t.description, defaultSize: t.size, sizes: t.sizes, theme: designFor(id).palette, slots: slotsOf(id), required: t.required, picture: id === 'customer' ? 'partner (the customer logo, only when passed)' : id === 'cards' || id === 'mark' ? 'none' : 'image (any picture, through the dot shader)' };
		}),
		sizes: [...imageSizes(), { id: 'custom', kinds: ['share', 'social'], label: 'Custom', width: 0, height: 0, aliases: [], note: '--width and --height, 200 to 4000' }],
		palettes: palettes().map((p) => ({ name: p.name, bg: p.bg, dots: p.fill, text: p.text })),
		samples: sampleNames().map((n) => `sample:${n}`),
		renders: RENDERS,
		dithers: DITHERS,
		fields: FIELDS,
		formats: ['png', 'svg', 'jpg', 'webp'],
		notes: doc.notes,
	};
}

