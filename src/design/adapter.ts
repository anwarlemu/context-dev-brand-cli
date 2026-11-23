import { createCanvas, loadImage } from '@napi-rs/canvas';
import { brandFonts } from '../assets/canvas.js';
import { designOf, infoOf, pictureFor, renderDesign, slotKey, slotsOf, wordColors } from '../assets/image.js';
import { frameOf, imageDoc, TEMPLATES, type Design, type Template } from '../assets/og.js';
import { brand } from '../lib/brand.js';
import { sheetCanvas, type Adapter, type DesignDoc, type Painter } from './index.js';

// This brand's side of the design core: what can be made and how a document becomes the engine's own request.

const isImage = (id: string): id is Template => (TEMPLATES as string[]).includes(id);

/** The engine's request a document stands for. */
function imageDesign(doc: DesignDoc): Design {
	const o = doc.options;
	const t = doc.template as Template;
	const set: Record<string, unknown> = { palette: doc.theme, seed: doc.seed, dot: o.dot, gap: o.gap, field: o.field, render: o.render, fillPct: o.fill, hollowPct: o.hollow, dither: o.dither, cutout: o.cutout, keyTol: o['key-tol'] };
	const flag = (v: unknown) => (v === undefined ? undefined : v === true || v === 'true');
	set.invert = flag(o.invert);
	set.burst = flag(o.burst);
	if (o['partner-color'] !== undefined) set.partnerWhite = !flag(o['partner-color']);
	for (const s of slotsOf(t)) if (doc.copy[s] !== undefined) set[slotKey(s)] = doc.copy[s];
	if (doc.images.picture) set.image = doc.images.picture;
	return designOf({ template: t, size: doc.size.id, ...(doc.size.id === 'custom' ? { width: doc.size.width, height: doc.size.height } : {}), set: set as Partial<Design> });
}

const imageOptions = (t: Template): DesignDoc['options'] => {
	const d = { ...imageDoc().base, ...imageDoc().templates[t].set };
	return infoOf(t).options.some((o) => o.id === 'dot') ? { dot: d.dot!, gap: d.gap!, field: d.field! } : {};
};
/** Templates where a seed changes something. */
const seeded = (t: Template) => t === 'banner' || t === 'social' || t === 'customer';

export function adapter(): Adapter {
	return {
		brand: brand().bin,
		templates: () => TEMPLATES.map(infoOf),
		defaults(template, size) {
			const t = template as Template;
			const f = frameOf({ size, w: 1200, h: 675 });
			return { size: { id: size, width: f.w, height: f.h }, theme: { ...imageDoc().base, ...imageDoc().templates[t].set }.palette!, seed: seeded(t) ? 1 : undefined, options: imageOptions(t) };
		},
		async render(doc, dir, out) {
			if (!isImage(doc.template)) throw new Error(`Unknown template ${doc.template}.`);
			const d = imageDesign(doc);
			const picture = await pictureFor(d, dir, doc.images.partner);
			const r = renderDesign(d, picture, { png: out.formats.includes('png'), svg: out.formats.includes('svg'), jpg: out.formats.includes('jpg'), webp: out.formats.includes('webp'), scale: out.scale }, doc.layers);
			const files: Record<string, Uint8Array> = {};
			for (const f of out.formats) {
				const v = r[f as 'png'];
				if (v !== undefined) files[f] = typeof v === 'string' ? Buffer.from(v) : v;
			}
			return { files, layers: r.layers };
		},
		sample: (template) => {
			const s = imageDoc().templates[template as Template].sample;
			return Object.fromEntries(Object.entries(s).map(([k, v]) => [k === 'partnerName' ? 'partner-name' : k, v]));
		},
		colors: wordColors,
		aliases: { sizes: imageDoc().aliases, themes: {}, copy: { partnername: 'partner-name' } },
	};
}

/** Contact sheets, on the same canvas with the brand's face. */
export const paint: Painter = (spec) => {
	brandFonts();
	return sheetCanvas(spec, { createCanvas, loadImage } as never, brandFonts().sans);
};
