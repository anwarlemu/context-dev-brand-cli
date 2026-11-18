import type { Pixels } from './png.js';
import { drawImage } from './raster.js';

// The website's kit shader (the library's image-dot-shader, itself the brand kit's blog-cover dot shader) on plain
// pixels: the picture fitted into a fixed 80 by 60 grid, each cell solid, hollow or empty. Its grid and thresholds are
// the kit's so a picture sits beside the official artwork; `illustrate --shader kit` uses it, and the brand's own
// kit artwork is read back with `parseKitSvg`.

export const KIT_COLS = 80;
export const KIT_ROWS = 60;
const SS = 4;
const FW = KIT_COLS * SS;
const FH = KIT_ROWS * SS;
const SUBJECT_SCALE = 0.84;
const TONE_AMOUNT = 0.75;
const CONTRAST = 2.2;
const DITHER = 0.22;
const TEXTURE = 0.12;
const FILLED_AT = 0.55;
const HOLLOW_AT = 0.16;
const MIN_COVERAGE = 0.08;
const BACKGROUND_TOLERANCE = 0.06;
const BACKGROUND_FEATHER = 0.1;
const OPAQUE_EDGE = 0.9;

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lin = (c: number) => {
	const v = c / 255;
	return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
function hashNoise(x: number, y: number) {
	const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
	return n - Math.floor(n);
}
function smoothNoise(x: number, y: number) {
	const x0 = Math.floor(x);
	const y0 = Math.floor(y);
	const sx = (x - x0) ** 2 * (3 - 2 * (x - x0));
	const sy = (y - y0) ** 2 * (3 - 2 * (y - y0));
	const top = hashNoise(x0, y0) + (hashNoise(x0 + 1, y0) - hashNoise(x0, y0)) * sx;
	const bottom = hashNoise(x0, y0 + 1) + (hashNoise(x0 + 1, y0 + 1) - hashNoise(x0, y0 + 1)) * sx;
	return top + (bottom - top) * sy;
}
function classify(column: number, row: number, coverage: number, darkness: number) {
	if (coverage < MIN_COVERAGE) return 0;
	const contrasted = clamp01((darkness - 0.5) * CONTRAST + 0.5);
	const texture = (smoothNoise(column / 3.2, row / 3.2) - 0.5) * TEXTURE;
	let value = Math.sqrt(coverage) * (1 - TONE_AMOUNT * (1 - clamp01(contrasted + texture)));
	value += (BAYER[(row & 3) * 4 + (column & 3)]! - 0.5) * DITHER * 0.5;
	if (value >= FILLED_AT) return 2;
	return value >= HOLLOW_AT ? 1 : 0;
}

/** One state per kit cell (0 absent, 1 hollow, 2 filled) for any picture. */
export function kitShade(img: Pixels): Uint8Array {
	const scale = Math.min(FW / img.width, FH / img.height) * SUBJECT_SCALE;
	const width = Math.max(1, Math.round(img.width * scale));
	const height = Math.max(1, Math.round(img.height * scale));
	const region = { x: Math.round((FW - width) / 2), y: Math.round((FH - height) / 2), width, height };
	const field = drawImage(img, FW, FH, region.x, region.y, width, height);
	const px = field.data;
	const edges: number[] = [];
	const right = region.x + region.width - 1;
	const bottom = region.y + region.height - 1;
	for (let x = region.x; x <= right; x++) edges.push((region.y * FW + x) * 4, (bottom * FW + x) * 4);
	for (let y = region.y; y <= bottom; y++) edges.push((y * FW + region.x) * 4, (y * FW + right) * 4);
	const edgeAlpha = edges.reduce((s, o) => s + px[o + 3]!, 0) / (edges.length * 255);
	if (edgeAlpha >= OPAQUE_EDGE) {
		const backdrop = [0, 1, 2].map((c) => edges.reduce((s, o) => s + px[o + c]!, 0) / edges.length);
		for (let y = region.y; y < region.y + region.height; y++) for (let x = region.x; x < region.x + region.width; x++) {
			const o = (y * FW + x) * 4;
			const d = Math.hypot(px[o]! - backdrop[0]!, px[o + 1]! - backdrop[1]!, px[o + 2]! - backdrop[2]!) / (255 * Math.sqrt(3));
			px[o + 3] = px[o + 3]! * clamp01((d - BACKGROUND_TOLERANCE) / BACKGROUND_FEATHER);
		}
	}
	const states = new Uint8Array(KIT_COLS * KIT_ROWS);
	for (let row = 0; row < KIT_ROWS; row++) for (let column = 0; column < KIT_COLS; column++) {
		let coverage = 0;
		let darkness = 0;
		for (let dy = 0; dy < SS; dy++) for (let dx = 0; dx < SS; dx++) {
			const o = ((row * SS + dy) * FW + column * SS + dx) * 4;
			const a = px[o + 3]! / 255;
			if (a === 0) continue;
			const l = Math.cbrt(0.2126 * lin(px[o]!) + 0.7152 * lin(px[o + 1]!) + 0.0722 * lin(px[o + 2]!));
			coverage += a;
			darkness += a * (1 - l);
		}
		states[row * KIT_COLS + column] = classify(column, row, coverage / SS ** 2, coverage > 0 ? darkness / coverage : 0);
	}
	return states;
}

/** Reads a kit SVG (its `filled` and `hollow` dashed runs, pitch 10) back into cell states. */
export function parseKitSvg(svg: string, pitch = 10): Uint8Array {
	const states = new Uint8Array(KIT_COLS * KIT_ROWS);
	for (const [id, state] of [['filled', 2], ['hollow', 1]] as const) {
		const runs = new RegExp(`id="${id}"[^>]* d="([^"]*)"`).exec(svg)?.[1] ?? '';
		for (const run of runs.matchAll(/M([\d.]+) ([\d.]+)h([\d.]+)/g)) {
			const first = Math.floor(Number(run[2]) / pitch) * KIT_COLS + Math.floor(Number(run[1]) / pitch);
			states.fill(state, first, first + Math.floor(Number(run[3]) / pitch) + 1);
		}
	}
	return states;
}
