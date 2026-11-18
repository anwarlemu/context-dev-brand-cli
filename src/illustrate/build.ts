import { readFileSync } from 'node:fs';
import { colorHex } from '../lib/brand.js';
import { unknownName } from '../lib/names.js';
import { pkgPath } from '../lib/paths.js';
import { KIT_COLS, KIT_ROWS, kitShade, parseKitSvg } from './kit.js';
import type { Pixels } from './png.js';
import { Canvas, type Op } from './raster.js';
import { type Illustration, type Layer, r2 } from './render.js';
import { EMPTY, FIELD, FILLED, HOLLOW, cutout, grid, hexLightness, imageRect, shade, type Dither, type Render } from './shader.js';

// From a subject or a picture and settings to an Illustration. Everything brand-specific (palettes, presets, the
// built-in subjects, the kit artwork) is read from brand/illustrate.json; the settings are the shader's own.

export type Settings = {
	width: number; height: number; pad: number; dot: number; gap: number; ring: number; fit: number; offsetX: number; offsetY: number;
	cutout: 'auto' | 'whole'; keyTol: number; render: Render; fill: number; hollow: number; contrast: number; edges: number;
	dither: Dither; invert: boolean; empty: 'hidden' | 'field'; field: 'none' | 'faint' | 'rings' | 'dots'; palette: string;
	fieldOpacity?: number; transparent?: boolean; seed: number; shader: 'playground' | 'kit';
};
type PaletteDef = { bg: string; fill: string; ring: string; field: string; fieldOpacity: number; ringOpacity?: number };
type Subject = { kind: 'picture' | 'mark' | 'burst' | 'kit'; $source: string; size?: [number, number]; ops?: Op[]; settings?: Partial<Settings>; colors?: Partial<PaletteDef>; file?: string; [k: string]: unknown };
type BrandIllustrate = { defaults: Settings; palettes: Record<string, PaletteDef & { $source: string }>; presets: Record<string, Partial<Settings> & { $source: string }>; subjects: Record<string, Subject>; kit: Record<string, number> & { ringOpacity: { white: number; other: number } } };

let data: BrandIllustrate | undefined;
export function illustrateData(): BrandIllustrate {
	data ??= JSON.parse(readFileSync(pkgPath('brand', 'illustrate.json'), 'utf8'));
	return data!;
}

export const ENUMS = {
	render: ['toneEdges', 'tone', 'edges', 'silhouette'],
	dither: ['none', 'diffuse', 'pattern'],
	cutout: ['auto', 'whole'],
	empty: ['hidden', 'field'],
	field: ['none', 'faint', 'rings', 'dots'],
	shader: ['playground', 'kit'],
} as const;

const strip = <T extends object>(o: T | undefined) => Object.fromEntries(Object.entries(o ?? {}).filter(([k, v]) => !k.startsWith('$') && v !== undefined)) as Partial<Settings>;

/** Defaults, then the preset, then the subject's own settings, then what was passed. Names are checked. */
export function resolveSettings(subject: string | undefined, preset: string | undefined, given: Partial<Settings>): Settings {
	const d = illustrateData();
	if (preset && !d.presets[preset]) throw unknownName('preset', preset, Object.keys(d.presets));
	if (subject && !d.subjects[subject]) throw unknownName('subject', subject, Object.keys(d.subjects));
	const s = { ...d.defaults, seed: 0, shader: 'playground', ...strip(preset ? d.presets[preset] : undefined), ...strip(subject ? d.subjects[subject]!.settings : undefined), ...strip(given) } as Settings;
	if (!d.palettes[s.palette]) throw unknownName('palette', s.palette, Object.keys(d.palettes));
	for (const [key, pool] of Object.entries(ENUMS)) {
		const v = (s as Record<string, unknown>)[key] as string;
		if (!(pool as readonly string[]).includes(v)) throw unknownName(key, String(v), [...pool]);
	}
	for (const key of ['width', 'height', 'pad', 'dot', 'gap', 'ring', 'fit', 'offsetX', 'offsetY', 'keyTol', 'fill', 'hollow', 'contrast', 'edges', 'seed'] as const) {
		if (!Number.isFinite(s[key])) throw new Error(`--${key} needs a number`);
	}
	s.width = Math.round(Math.min(6000, Math.max(50, s.width)));
	s.height = Math.round(Math.min(6000, Math.max(50, s.height)));
	s.dot = Math.max(1, s.dot);
	return s;
}

/** A palette's colors as hex, from the brand tokens. */
export function paletteColors(name: string, override: Partial<PaletteDef> = {}) {
	const p = { ...illustrateData().palettes[name]!, ...strip(override as object) } as PaletteDef;
	const hex = (token: string) => {
		const v = colorHex(token);
		if (!v) throw new Error(`Palette ${name}: no brand color token ${token}`);
		return v;
	};
	return { bg: hex(p.bg), fill: hex(p.fill), ring: hex(p.ring), field: hex(p.field), fieldOpacity: p.fieldOpacity, ringOpacity: p.ringOpacity ?? 1, tokens: { bg: p.bg, fill: p.fill, ring: p.ring, field: p.field } };
}

/** A built-in picture subject drawn into pixels. */
export function subjectPixels(name: string): Pixels {
	const s = illustrateData().subjects[name];
	if (!s) throw unknownName('subject', name, Object.keys(illustrateData().subjects));
	if (s.kind !== 'picture' || !s.size || !s.ops) throw new Error(`${name} is not a picture subject`);
	const c = new Canvas(s.size[0], s.size[1]);
	for (const op of s.ops) c.draw(op);
	return c.pixels();
}

type Colors = ReturnType<typeof paletteColors>;
const layer = (id: string, kind: 'fill' | 'ring', color: string, opacity: number, stroke?: number, token?: string): Layer => ({ id, kind, color, ...(token ? { token } : {}), opacity, ...(stroke ? { stroke } : {}), circles: [] });

/** The playground's grid states into layers, as its buildSVG groups them. */
function gridLayers(st: Uint8Array, g: ReturnType<typeof grid>, s: Settings, c: Colors): Layer[] {
	const rad = s.dot / 2;
	const ringR = Math.max(0.1, rad - s.ring / 2);
	const fieldOpacity = s.fieldOpacity ?? c.fieldOpacity;
	const field = s.field === 'rings' ? layer('field', 'ring', c.field, fieldOpacity, s.ring, c.tokens.field) : layer('field', 'fill', c.field, fieldOpacity, undefined, c.tokens.field);
	const hollow = layer('hollow', 'ring', c.ring, c.ringOpacity, s.ring, c.tokens.ring);
	const filled = layer('filled', 'fill', c.fill, 1, undefined, c.tokens.fill);
	for (let r = 0; r < g.rows; r++) for (let q = 0; q < g.cols; q++) {
		const x = r2(g.ox + (q + 0.5) * g.pitch);
		const y = r2(g.oy + (r + 0.5) * g.pitch);
		let v = st[r * g.cols + q]!;
		if (v === EMPTY) {
			if (s.empty === 'hidden') continue;
			v = FIELD;
		}
		// The faint grid is two-level: solid or faint, never hollow.
		if (v === HOLLOW && s.field === 'faint') v = FIELD;
		if (v === FILLED) filled.circles.push(x, y, rad);
		else if (v === HOLLOW) hollow.circles.push(x, y, ringR);
		else if (s.field === 'rings') field.circles.push(x, y, ringR);
		else if (s.field === 'faint') field.circles.push(x, y, rad);
		else if (s.field === 'dots') field.circles.push(x, y, Math.max(0.5, rad * 0.28));
	}
	return [field, hollow, filled];
}

/** The logomark laid out on the grid: solid parts lit, the hole in rings (the film's identity scene). */
function markLayers(sub: Subject, s: Settings, c: Colors): Layer[] {
	const [gw, gh] = sub.size!;
	const sq = sub.square as { left: number; top: number; right: number; bottom: number };
	const hole = sub.hole as { cx: number; cy: number; r: number };
	const disc = sub.disc as { cx: number; cy: number; r: number };
	const kindAt = (x: number, y: number, dr: number): 'lit' | 'ring' | null => {
		if (Math.hypot(x - disc.cx, y - disc.cy) <= disc.r - dr) return 'lit';
		const inJoin = x >= disc.cx && x - dr < sq.left && y >= disc.cy - disc.r + dr && y <= disc.cy - Math.sqrt(disc.r ** 2 - (sq.left - disc.cx) ** 2);
		if (inJoin) return 'lit';
		const inSquare = x - dr >= sq.left && x + dr <= sq.right && y - dr >= sq.top && y + dr <= sq.bottom;
		if (!inSquare) return null;
		const fromHole = Math.hypot(x - hole.cx, y - hole.cy);
		if (fromHole <= hole.r - dr) return 'ring';
		return fromHole <= hole.r + dr ? null : 'lit';
	};
	const g = grid(s.width, s.height, s.dot, s.gap, s.pad);
	const R = imageRect(s.width, s.height, gw, gh, s.fit, s.offsetX, s.offsetY, s.pad);
	const scale = R.w / gw;
	const rad = s.dot / 2;
	const fieldOpacity = s.fieldOpacity ?? c.fieldOpacity;
	const field = s.field === 'rings' ? layer('field', 'ring', c.field, fieldOpacity, s.ring, c.tokens.field) : layer('field', 'fill', c.field, fieldOpacity, undefined, c.tokens.field);
	const hollow = layer('hollow', 'ring', c.ring, c.ringOpacity, s.ring, c.tokens.ring);
	const filled = layer('filled', 'fill', c.fill, 1, undefined, c.tokens.fill);
	for (let r = 0; r < g.rows; r++) for (let q = 0; q < g.cols; q++) {
		const x = g.ox + (q + 0.5) * g.pitch;
		const y = g.oy + (r + 0.5) * g.pitch;
		const k = kindAt((x - R.x) / scale, (y - R.y) / scale, rad / scale);
		const at = [r2(x), r2(y)];
		if (k === 'lit') filled.circles.push(at[0]!, at[1]!, rad);
		else if (k === 'ring') hollow.circles.push(at[0]!, at[1]!, r2(Math.max(0.1, rad - s.ring / 2)));
		else if (s.field === 'faint') field.circles.push(at[0]!, at[1]!, rad);
		else if (s.field === 'rings') field.circles.push(at[0]!, at[1]!, r2(Math.max(0.1, rad - s.ring / 2)));
		else if (s.field === 'dots') field.circles.push(at[0]!, at[1]!, r2(Math.max(0.5, rad * 0.28)));
	}
	return [field, hollow, filled];
}

/** The customer story's burst: rings of dots growing outward, lit from below, hollow where dim or near the middle. */
function burstLayers(sub: Subject, s: Settings, c: Colors): Layer[] {
	const W = s.width;
	const H = s.height;
	const cx = W / 2 + s.offsetX * W;
	const cy = H / 2 + s.offsetY * H;
	const R = (Math.sqrt(W * H) * s.fit) / 100;
	const rays = sub.rays as number;
	const step = (Math.PI * 2) / rays;
	const far = R * (sub.far as number);
	const hollow = layer('hollow', 'ring', c.ring, c.ringOpacity, r2(s.ring * 1.6), c.tokens.ring);
	const filled = layer('filled', 'fill', c.fill, 1, undefined, c.tokens.fill);
	let ring = 0;
	for (let r = R * (sub.inner as number); r < far; r *= sub.grow as number, ring++) {
		const off = ring % 2 ? step / 2 : 0;
		for (let i = 0; i < rays; i++) {
			const a = i * step + off;
			const x = cx + Math.cos(a) * r;
			const y = cy + Math.sin(a) * r;
			const lit = (1 + Math.sin(a)) / 2;
			const grow = Math.min(1, r / (R * 0.7));
			const rad = Math.min(r * step * 0.4, R * 0.036) * (0.35 + 0.65 * lit) * (0.45 + 0.55 * grow);
			if (rad < 1.2) continue;
			if (x + rad < 0 || x - rad > W || y + rad < 0 || y - rad > H) continue;
			if (lit < 0.3 || grow < 0.35) hollow.circles.push(r2(x), r2(y), r2(Math.max(0.5, rad - s.ring)));
			else filled.circles.push(r2(x), r2(y), r2(rad));
		}
	}
	return [hollow, filled];
}

/** Kit states (80 by 60, pitch 10) into layers: the faint ring backdrop kept clear of the art, then the dots. */
function kitLayers(states: Uint8Array, c: Colors, bgToken: string): { width: number; height: number; layers: Layer[]; grid: { ox: number; oy: number; pitch: number } } {
	const k = illustrateData().kit;
	const pitch = k.pitch!;
	const rad = k.dot! / 2;
	const ringR = rad - k.ring! / 2;
	const dots: [number, number][] = [];
	const filled = layer('filled', 'fill', c.fill, 1, undefined, c.tokens.fill);
	const hollow = layer('hollow', 'ring', c.ring, c.ringOpacity, k.ring, c.tokens.ring);
	for (let row = 0; row < KIT_ROWS; row++) for (let col = 0; col < KIT_COLS; col++) {
		const v = states[row * KIT_COLS + col];
		if (!v) continue;
		const x = col * pitch + pitch / 2;
		const y = row * pitch + pitch / 2;
		dots.push([x, y]);
		if (v === 2) filled.circles.push(x, y, rad);
		else hollow.circles.push(x, y, ringR);
	}
	const opacity = bgToken === 'white' ? k.ringOpacity.white : k.ringOpacity.other;
	const backdrop = layer('field', 'ring', c.fill, opacity, k.backdropStroke, c.tokens.fill);
	const bp = k.backdropPitch!;
	const first = (len: number) => (len - Math.floor(len / bp) * bp + bp) / 2;
	const clear = k.halo! + k.backdropRadius!;
	for (let y = first(k.height!); y < k.height!; y += bp) for (let x = first(k.width!); x < k.width!; x += bp) {
		// The kit paints a halo (16px around every dot) over the rings; a ring it would touch is left out.
		if (dots.some(([dx, dy]) => Math.abs(dx - x) < clear && Math.abs(dy - y) < clear && Math.hypot(dx - x, dy - y) < clear)) continue;
		backdrop.circles.push(x, y, k.backdropRadius!);
	}
	return { width: k.width!, height: k.height!, layers: [backdrop, hollow, filled], grid: { ox: 0, oy: 0, pitch } };
}

const lattice = (g: ReturnType<typeof grid>) => ({ ox: g.ox, oy: g.oy, pitch: g.pitch });

export type Built = { illustration: Illustration; settings: Settings; subject?: string; kind: string; source: string; info?: string };

/** Builds an illustration from a named subject or a picture (exactly one). */
export function buildIllustration(opts: { subject?: string; picture?: Pixels; pictureName?: string; preset?: string; settings: Partial<Settings> }): Built {
	const d = illustrateData();
	const sub = opts.subject ? d.subjects[opts.subject] : undefined;
	if (opts.subject && !sub) throw unknownName('subject', opts.subject, Object.keys(d.subjects));
	if (!sub && !opts.picture) throw new Error('Name a subject or pass --image <file>');
	const s = resolveSettings(opts.subject, opts.preset, opts.settings);
	const c = paletteColors(s.palette, sub?.colors);
	const name = opts.subject ?? opts.pictureName ?? 'picture';
	const desc = `Dot illustration of ${name}; palette ${s.palette} (${Object.entries(c.tokens).map(([k, v]) => `${k} ${v}`).join(', ')}); seed ${s.seed}.`;
	const bg = s.transparent ? null : c.bg;
	const backgroundToken = s.transparent ? undefined : c.tokens.bg;
	const kind = sub?.kind ?? 'picture';
	if (kind === 'kit' || s.shader === 'kit') {
		const states = sub?.kind === 'kit' ? parseKitSvg(readFileSync(pkgPath('brand', sub.file!), 'utf8')) : kitShade(opts.picture ?? subjectPixels(opts.subject!));
		const k = kitLayers(states, c, c.tokens.bg);
		return { illustration: { ...k, background: bg, backgroundToken, title: name, desc }, settings: s, subject: opts.subject, kind: 'kit', source: sub?.$source ?? 'picture through the kit shader' };
	}
	const W = s.width;
	const H = s.height;
	if (kind === 'mark') return { illustration: { width: W, height: H, background: bg, backgroundToken, layers: markLayers(sub!, s, c), title: name, desc, grid: lattice(grid(W, H, s.dot, s.gap, s.pad)) }, settings: s, subject: opts.subject, kind, source: sub!.$source };
	if (kind === 'burst') return { illustration: { width: W, height: H, background: bg, backgroundToken, layers: burstLayers(sub!, s, c), title: name, desc }, settings: s, subject: opts.subject, kind, source: sub!.$source };
	const img = opts.picture ?? subjectPixels(opts.subject!);
	const cut = cutout(img, s.cutout, s.keyTol);
	const g = grid(W, H, s.dot, s.gap, s.pad);
	const R = imageRect(W, H, img.width, img.height, s.fit, s.offsetX, s.offsetY, s.pad);
	const st = shade(cut.pixels, g, R, {
		render: s.render, fillPct: s.fill, hollowPct: s.hollow, localContrast: s.contrast, edgeAmt: s.edges, dither: s.dither, invert: s.invert,
		cutout: s.cutout, keyTol: s.keyTol, dotsLight: hexLightness(c.fill) > hexLightness(c.bg), seed: s.seed,
	});
	return { illustration: { width: W, height: H, background: bg, backgroundToken, layers: gridLayers(st, g, s, c), title: name, desc, grid: lattice(g) }, settings: s, subject: opts.subject, kind: 'picture', source: sub?.$source ?? 'picture', info: cut.info };
}
