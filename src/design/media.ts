import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { surface } from '../assets/canvas.js';
import { checkReel, encode, drawLoopFrame, hasFfmpeg, loopFrames, loopLayers, loopTemplates, reelCopySlots, reelFrames, reelLayers, videoDoc, type LoopTemplate, type ReelCopy } from '../assets/video.js';
import { toPng } from '../assets/canvas.js';
import { palettes } from '../assets/og.js';
import { findItem, merchDoc, merchInfo, merchItems, renderItem } from '../assets/merch.js';
import { readPicture as readAsset } from '../assets/picture.js';
import { samplePicture } from '../assets/samples.js';
import { buildIllustration, ENUMS, illustrateData, paletteColors, resolveSettings, type Settings } from '../illustrate/build.js';
import { readPicture } from '../illustrate/decode.js';
import { encodePng } from '../illustrate/png.js';
import { toPixels, toSvg } from '../illustrate/render.js';
import type { Adapter, DesignDoc, DrawnLayer, OptionValue, TemplateInfo } from './index.js';
import { isAbsolute, resolve } from 'node:path';

// Merch, illustrations and video as designs: copy, theme, options, size and seed with the same undo, history, variants
// and check as images. They have no parts that move on their own.

type Render = Awaited<ReturnType<Adapter['render']>>;
type Defaults = ReturnType<Adapter['defaults']>;
export type Media = { infos(): TemplateInfo[]; defaults(id: string, size: string): Defaults; render(doc: DesignDoc, dir: string, out: Parameters<Adapter['render']>[2]): Promise<Render>; sample(id: string): Record<string, string> };

/* ---- Merch ---- */

const merch: Media = {
	infos: () => merchItems().map(merchInfo),
	defaults(id) {
		const item = findItem(id);
		return { size: { id: 'print', width: Math.round((item.size[0] + 2 * item.bleed) * 300), height: Math.round((item.size[1] + 2 * item.bleed) * 300) }, theme: item.variants[0]!, seed: item.layers.some((l) => l.type === 'dots' && l.mode !== 'field') ? 1 : undefined, options: { dpi: 300 } };
	},
	async render(doc, dir, out) {
		const item = findItem(doc.template);
		const p = doc.images.picture;
		const picture = !p ? null : p.startsWith('sample:') ? (samplePicture(p) ?? null) : await readAsset(dir, p);
		const dpi = Math.max(36, Math.min(600, Number(doc.options.dpi ?? 300) * out.scale));
		const r = renderItem(item, { variant: doc.theme, slots: doc.copy, picture, guides: doc.options.guides === true || doc.options.guides === 'true', seed: doc.seed, dpi, png: out.formats.includes('png') || !out.formats.length, svg: out.formats.includes('svg'), pdf: out.formats.includes('pdf') });
		return { files: pickFiles(out.formats, r), layers: r.layers };
	},
	sample: (id) => Object.fromEntries(Object.entries(merchDoc().sample).filter(([k]) => merchInfo(findItem(id)).copy.some((c) => c.id === k))),
};

function pickFiles(formats: string[], r: object): Record<string, Uint8Array> {
	const files: Record<string, Uint8Array> = {};
	for (const f of formats) {
		const v = (r as Record<string, Uint8Array | string | undefined>)[f];
		if (v !== undefined) files[f] = typeof v === 'string' ? Buffer.from(v) : v;
	}
	return files;
}

/* ---- Illustrations ---- */

const ILL = 'illustration';
const subjectOf = (id: string) => (id === ILL ? undefined : id.slice(ILL.length + 1));
const ILL_SIZES: Record<string, [number, number]> = { square: [1080, 1080], og: [1200, 630], portrait: [1080, 1350], story: [1080, 1920], landscape: [1200, 675], 'x-banner': [1500, 500] };
const NUM: [string, keyof Settings, [number, number]][] = [['dot', 'dot', [1, 60]], ['gap', 'gap', [0, 60]], ['fit', 'fit', [10, 200]], ['offset-x', 'offsetX', [-0.6, 0.6]], ['offset-y', 'offsetY', [-0.6, 0.6]], ['fill', 'fill', [0, 100]], ['hollow', 'hollow', [0, 100]], ['contrast', 'contrast', [0, 3]], ['edges', 'edges', [0, 2]], ['key-tol', 'keyTol', [0, 40]]];
const illustration: Media = {
	infos: () => [undefined, ...Object.keys(illustrateData().subjects)].map((subject): TemplateInfo => {
		const kind = subject ? illustrateData().subjects[subject]!.kind : 'picture';
		const shaded = kind === 'picture';
		return {
			id: subject ? `${ILL}-${subject}` : ILL,
			kind: 'illustration',
			description: subject ? `The ${subject} drawn in dots (${kind}).` : 'Any picture drawn in dots.',
			sizes: ['frame', ...Object.keys(ILL_SIZES), 'custom'],
			themes: Object.keys(illustrateData().palettes),
			copy: [],
			images: subject ? [] : [{ id: 'picture', required: true }],
			options: shaded
				? [...NUM.map(([id, , range]) => ({ id, range })), { id: 'render', values: [...ENUMS.render] }, { id: 'dither', values: [...ENUMS.dither] }, { id: 'cutout', values: [...ENUMS.cutout] }, { id: 'empty', values: [...ENUMS.empty] }, { id: 'field', values: [...ENUMS.field] }, { id: 'invert', values: ['true', 'false'] }, { id: 'transparent', values: ['true', 'false'] }]
				: [{ id: 'transparent', values: ['true', 'false'] }],
			layers: [],
			grounds: Object.fromEntries(Object.keys(illustrateData().palettes).map((p) => [p, paletteColors(p).bg])),
			layouts: subject ? [`${subject} illustration`] : [],
		};
	}),
	defaults(id, size): Defaults {
		const s = resolveSettings(subjectOf(id), undefined, {});
		const [w, h] = ILL_SIZES[size] ?? [s.width, s.height];
		const shaded = (illustrateData().subjects[subjectOf(id) ?? '']?.kind ?? 'picture') === 'picture';
		return { size: { id: size, width: w, height: h }, theme: s.palette, seed: shaded ? 0 : undefined, options: shaded ? { dot: s.dot, gap: s.gap, fit: s.fit, fill: s.fill, hollow: s.hollow, field: s.field } : {} };
	},
	async render(doc, dir, out) {
		const o = doc.options;
		const set: Record<string, unknown> = { palette: doc.theme, seed: doc.seed };
		if (doc.size.id !== 'frame') Object.assign(set, { width: doc.size.width, height: doc.size.height });
		for (const [id, key] of NUM) if (o[id] !== undefined) set[key] = Number(o[id]);
		for (const k of ['render', 'dither', 'cutout', 'empty', 'field']) if (o[k] !== undefined) set[k] = o[k];
		for (const k of ['invert', 'transparent']) if (o[k] === true || o[k] === 'true') set[k] = true;
		const p = doc.images.picture;
		const b = buildIllustration({ subject: subjectOf(doc.template), picture: p ? await readPicture(isAbsolute(p) ? p : resolve(dir, p)) : undefined, pictureName: p, settings: set as Partial<Settings> });
		const ill = b.illustration;
		const dots = ill.layers.filter((l) => l.id !== 'field').flatMap((l) => l.circles);
		const layers: DrawnLayer[] = [];
		if (dots.length) {
			let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
			for (let i = 0; i < dots.length; i += 3) {
				x0 = Math.min(x0, dots[i]! - dots[i + 2]!);
				y0 = Math.min(y0, dots[i + 1]! - dots[i + 2]!);
				x1 = Math.max(x1, dots[i]! + dots[i + 2]!);
				y1 = Math.max(y1, dots[i + 1]! + dots[i + 2]!);
			}
			layers.push({ id: 'art', kind: 'art', box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, bleeds: true, can: {} });
		}
		return { files: pickFiles(out.formats, { ...(out.formats.includes('svg') ? { svg: toSvg(ill) } : {}), ...(out.formats.includes('png') ? { png: encodePng(toPixels(ill, out.scale)) } : {}) }), layers };
	},
	sample: () => ({}),
};

/* ---- Video ---- */

const LOOP = 'loop-';
const video: Media = {
	infos: () => [
		...loopTemplates().map((t): TemplateInfo => ({
			id: `${LOOP}${t}`,
			kind: 'video',
			description: videoDoc().loops.templates[t].description,
			sizes: Object.keys(videoDoc().loops.sizes),
			themes: palettes().map((p) => p.name),
			copy: t === 'logo' ? [{ id: 'headline' }] : [],
			images: [],
			options: [{ id: 'seconds', range: [2, 20] }, { id: 'fps', range: [12, 60] }, { id: 'at', range: [0, 1], description: 'the moment of the still, as a share of the loop' }],
			layers: [],
			grounds: Object.fromEntries(palettes().map((p) => [p.name, p.bg])),
			formats: ['png', 'mp4'],
			layouts: [`${t} loop`],
		})),
		{ id: 'reel', kind: 'video', description: `The ${videoDoc().reel.seconds} second film, with every word passed in.`, sizes: ['reel'], themes: [], copy: reelCopySlots().map((s) => ({ id: s.id, ...(s.own ? {} : { required: true }), description: s.description })), images: [], options: [{ id: 'fps', range: [12, 60] }, { id: 'at', range: [0, videoDoc().reel.seconds], description: 'the second of the still' }], layers: [], formats: ['png', 'mp4'] },
	],
	defaults(id, size): Defaults {
		const d = videoDoc();
		if (id === 'reel') return { size: { id: 'reel', width: d.reel.width, height: d.reel.height }, seed: undefined, options: { at: 9.5, fps: d.reel.fps } };
		const [w, h] = d.loops.sizes[size] ?? d.loops.sizes.square!;
		return { size: { id: size, width: w, height: h }, theme: d.loops.templates[id.slice(LOOP.length) as LoopTemplate].palette, seed: 0, options: { seconds: d.loops.seconds, fps: d.loops.fps, at: 0 } };
	},
	async render(doc, _dir, out) {
		const n = (v: OptionValue | undefined, or: number) => (v === undefined ? or : Number(v));
		const { width, height } = doc.size;
		const files: Record<string, Uint8Array> = {};
		if (doc.template === 'reel') {
			const copy = checkReel(doc.copy);
			const fps = n(doc.options.fps, videoDoc().reel.fps);
			if (out.formats.includes('png')) await reelFrames(copy, fps, (png) => void (files.png = png), [n(doc.options.at, 9.5)]);
			if (out.formats.includes('mp4')) {
				const frames: Buffer[] = [];
				await reelFrames(copy, fps, (png) => void frames.push(png));
				files.mp4 = await toMp4(frames, width, height, fps, 'png');
			}
			return { files, layers: reelLayers(copy as ReelCopy, doc.copy) };
		}
		const o = { template: doc.template.slice(LOOP.length) as LoopTemplate, width, height, palette: doc.theme, seed: doc.seed ?? 0, headline: doc.copy.headline, seconds: n(doc.options.seconds, 6) };
		const s = surface(width, height, { scale: out.scale });
		drawLoopFrame(s.ctx, o, n(doc.options.at, 0) % 1);
		if (out.formats.includes('png')) files.png = toPng(s, { opaque: true });
		if (out.formats.includes('mp4')) {
			const fps = n(doc.options.fps, 30);
			function* raw() {
				for (const f of loopFrames({ ...o, fps })) yield f.rgba;
			}
			files.mp4 = await toMp4(raw(), width, height, fps, 'rgba');
		}
		return { files, layers: loopLayers(o) };
	},
	sample(id) {
		if (id !== 'reel') return {};
		const c = videoDoc().reel.copy as unknown as Record<string, unknown>;
		return Object.fromEntries(reelCopySlots().filter((s) => !s.own).map((s) => [s.id, Array.isArray(c[s.key]) ? (c[s.key] as string[]).join(' | ') : String(c[s.key])]));
	},
};

async function toMp4(frames: Iterable<Buffer>, width: number, height: number, fps: number, input: 'rgba' | 'png'): Promise<Uint8Array> {
	if (!hasFfmpeg()) throw new Error('MP4 needs ffmpeg on the PATH.');
	const dir = mkdtempSync(join(tmpdir(), 'ds-video-'));
	try {
		const path = join(dir, 'out.mp4');
		await encode(frames, { width, height, fps, input, outputs: [{ path, format: 'mp4' }] });
		return readFileSync(path);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

export const mediaKinds: Media[] = [merch, illustration, video];
