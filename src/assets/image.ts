import { brandFonts, surface, toPng, toSvg } from './canvas.js';
import { pick, unknown } from './io.js';
import { clampDim, designFor, drawDesign, frameOf, imageDoc, palettes, TEMPLATES, type Design, type Field, type Template } from './og.js';
import { readPicture, type Picture } from './picture.js';
import { samplePicture, sampleNames } from './samples.js';
import type { Dither, Render } from './shader.js';

// Share images and social posts as an API: a request (template, size, copy, positions, shader settings) becomes a
// design, and a design becomes PNG and SVG. The `image` command is a thin layer over this.

export const RENDERS: Render[] = ['toneEdges', 'tone', 'edges', 'silhouette'];
export const DITHERS: Dither[] = ['none', 'diffuse', 'pattern'];
export const FIELDS: Field[] = ['none', 'faint', 'rings'];
export type Kind = 'share' | 'social';

/** Every size id with its pixels: the share sizes, the social shapes, and `custom`. */
export function imageSizes(): { id: string; kind: Kind; label: string; width: number; height: number; aliases: string[] }[] {
	const doc = imageDoc();
	return [
		...Object.entries(doc.sizes).map(([id, s]) => ({ id, kind: 'share' as Kind, label: s.label, width: s.w, height: s.h, aliases: [] })),
		...Object.entries(doc.social).map(([id, s]) => ({ id, kind: 'social' as Kind, label: s.label, width: s.w, height: s.h, aliases: [s.label] })),
	];
}

/** A size as typed: an id (`og`, `s-4x5`), a ratio (`4:5`, `1.91:1`), or `custom`. */
export function sizeId(typed: string): string {
	const t = typed.trim().toLowerCase();
	if (t === 'custom') return 'custom';
	const hit = imageSizes().find((s) => s.id === t || s.aliases.includes(t));
	if (!hit) throw unknown('size', typed, [...imageSizes().map((s) => s.id), 'custom']);
	return hit.id;
}

export type ImageRequest = {
	template: string;
	/** Picks the default size (`og` for share, `s-16x9` for social) when `size` is not given. */
	kind?: Kind;
	size?: string;
	/** For `custom`: 200 to 4000 each. */
	width?: number;
	height?: number;
	/** Anything a design holds, over the template's opening copy and layout. */
	set?: Partial<Design>;
};

/** The design a request draws: the template's opening design at the size, then the request's settings. */
export function designOf(req: ImageRequest): Design {
	const template = pick('template', req.template, TEMPLATES) as Template;
	const kind = req.kind ? pick('kind', req.kind, ['share', 'social'] as const) : undefined;
	const size = req.size ? sizeId(req.size) : kind === 'social' ? Object.keys(imageDoc().social)[0]! : imageDoc().templates[template].size;
	if (size === 'custom' && (!req.width || !req.height)) throw new Error('A custom size needs --width and --height (200 to 4000).');
	if (size !== 'custom' && (req.width || req.height)) throw new Error(`--width and --height go with --size custom, not ${size}.`);
	const dims = size === 'custom' ? { w: clampDim(req.width!), h: clampDim(req.height!) } : undefined;
	const d: Design = { ...designFor(template, size, dims), ...stripUndefined(req.set ?? {}) };
	if (d.palette) d.palette = pick('palette', d.palette, palettes().map((p) => p.name));
	d.render = pick('render', d.render, RENDERS);
	d.dither = pick('dither', d.dither, DITHERS);
	d.field = pick('field', d.field, FIELDS);
	d.cutout = pick('cutout', d.cutout, ['auto', 'whole'] as const);
	return d;
}

function stripUndefined<T extends object>(o: T): Partial<T> {
	return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** The picture a design draws: for the customer story, the customer's logo (`partner`, only when one is given);
 * otherwise the design's image (a path, `sample:<name>`, or `none`). */
export async function pictureFor(d: Design, cwd: string, partner?: string): Promise<Picture | null> {
	if (d.template === 'customer') return partner ? readPicture(cwd, partner, 800) : null;
	if (!d.image || d.image === 'none') return null;
	if (d.image.toLowerCase().startsWith('sample:')) {
		const s = samplePicture(d.image);
		if (!s) throw unknown('sample picture', d.image.slice(7), sampleNames());
		return s;
	}
	return readPicture(cwd, d.image);
}

export type Rendered = { png?: Buffer; svg?: string; width: number; height: number };

/** Draws a design. `scale` multiplies the PNG's pixels (the editor downloads at 2); the SVG is at the frame size. */
export function renderDesign(d: Design, picture: Picture | null, opts: { png?: boolean; svg?: boolean; scale?: number } = { png: true }): Rendered {
	const L = frameOf(d);
	const out: Rendered = { width: Math.round(L.w * (opts.scale ?? 1)), height: Math.round(L.h * (opts.scale ?? 1)) };
	if (opts.png !== false) {
		const s = surface(L.w, L.h, { scale: opts.scale ?? 1 });
		drawDesign(s.canvas, d, picture, brandFonts());
		out.png = toPng(s);
	}
	if (opts.svg) {
		const s = surface(L.w, L.h, { svg: true });
		drawDesign(s.canvas, d, picture, brandFonts());
		out.svg = toSvg(s);
	}
	return out;
}

/** What `manifest` and `image --list` say about the templates. */
export function imageCatalog() {
	const doc = imageDoc();
	return {
		kinds: Object.entries(doc.kinds).map(([id, k]) => ({ id, label: k.label, templates: k.templates, sizes: Object.keys(k.sizes === 'sizes' ? doc.sizes : doc.social), custom: k.custom })),
		templates: TEMPLATES.map((id) => {
			const t = doc.templates[id];
			const d = designFor(id);
			return { id, name: t.label, description: t.description, defaultSize: t.size, palette: d.palette, slots: slotsOf(id), picture: id === 'customer' ? 'partner (the customer logo, only when passed)' : id === 'cards' ? 'none' : 'image (any picture, through the dot shader)' };
		}),
		sizes: [...imageSizes().map(({ aliases, ...s }) => ({ ...s, aliases })), { id: 'custom', kind: 'social', label: 'Custom', width: 0, height: 0, aliases: [], note: '--width and --height, 200 to 4000' }],
		palettes: palettes().map((p) => ({ name: p.name, bg: p.bg, dots: p.fill, text: p.text })),
		samples: sampleNames().map((n) => `sample:${n}`),
		renders: RENDERS,
		dithers: DITHERS,
		fields: FIELDS,
		notes: doc.notes,
	};
}

/** The text slots each template draws (its flags). */
export function slotsOf(t: Template): string[] {
	switch (t) {
		case 'banner':
			return ['headline'];
		case 'products':
			return ['headline', 'cta', 'lists'];
		case 'social':
			return ['headline', 'body'];
		case 'cards':
			return ['headline', 'cards', 'footer'];
		case 'customer':
			return ['headline', 'stat', 'partner-name'];
	}
}
