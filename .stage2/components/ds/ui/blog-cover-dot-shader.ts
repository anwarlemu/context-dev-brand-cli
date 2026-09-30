import type { CoverScene } from '@/components/ds/ui/blog-cover-scenes';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { clearGooField, createGooField, fuseGooField, readGooField } from '@/components/ds/ui/dot-morph-goo';
import type { DotMorphFrame } from '@/components/ds/ui/dot-morph-player';

/**
 * The Context Dot Shader from scripts/generate-blog-cover-dots.mjs, run live: a scene is drawn small, each grid cell's
 * coverage and tone are read back, and every cell becomes a filled dot, a hollow dot or nothing. The constants below
 * mirror the script's, so a scene held still lands on the same dots as the generated cover.
 */

export const COVER_GRID: DotGrid = { columns: 80, rows: 60, pitch: 10, dotRadius: 3.4, ringStroke: 1.6, haloRadius: 16 };
const CELL_COUNT = COVER_GRID.columns * COVER_GRID.rows;

const TONE_AMOUNT = 0.75;
const CONTRAST = 2.2;
const DITHER = 0.22;
const TEXTURE = 0.12;
const FILLED_AT = 0.55;
const HOLLOW_AT = 0.16;
const MIN_COVERAGE = 0.08;

// The canvas anti-aliases every pixel into its true area coverage, so two samples a side already measure a cell exactly.
const SAMPLES_PER_CELL = 2;
const FIELD_WIDTH = COVER_GRID.columns * SAMPLES_PER_CELL;
const FIELD_HEIGHT = COVER_GRID.rows * SAMPLES_PER_CELL;
const FIELD_SCALE = SAMPLES_PER_CELL / COVER_GRID.pitch;

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((value) => (value + 0.5) / 16);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function hashNoise(x: number, y: number) {
	const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
	return n - Math.floor(n);
}

function smoothNoise(x: number, y: number) {
	const x0 = Math.floor(x);
	const y0 = Math.floor(y);
	const fx = x - x0;
	const fy = y - y0;
	const sx = fx * fx * (3 - 2 * fx);
	const sy = fy * fy * (3 - 2 * fy);
	const top = hashNoise(x0, y0) + (hashNoise(x0 + 1, y0) - hashNoise(x0, y0)) * sx;
	const bottom = hashNoise(x0, y0 + 1) + (hashNoise(x0 + 1, y0 + 1) - hashNoise(x0, y0 + 1)) * sx;
	return top + (bottom - top) * sy;
}

const CELL_TEXTURE = new Float32Array(CELL_COUNT);
const CELL_DITHER = new Float32Array(CELL_COUNT);
for (let row = 0; row < COVER_GRID.rows; row++) {
	for (let column = 0; column < COVER_GRID.columns; column++) {
		CELL_TEXTURE[row * COVER_GRID.columns + column] = (smoothNoise(column / 3.2, row / 3.2) - 0.5) * TEXTURE;
		CELL_DITHER[row * COVER_GRID.columns + column] = (BAYER[(row & 3) * 4 + (column & 3)] - 0.5) * DITHER * 0.5;
	}
}

function classify(cell: number, coverage: number, tone: number) {
	if (coverage < MIN_COVERAGE) return DOT_ABSENT;
	const contrasted = clamp01((tone - 0.5) * CONTRAST + 0.5);
	const value = Math.sqrt(coverage) * (1 - TONE_AMOUNT * (1 - clamp01(contrasted + CELL_TEXTURE[cell]))) + CELL_DITHER[cell];
	if (value >= FILLED_AT) return DOT_FILLED;
	return value >= HOLLOW_AT ? DOT_HOLLOW : DOT_ABSENT;
}

/** Reads a generated cover back into one dot state per grid cell. */
export function parseCoverDots(svg: string): Uint8Array {
	const states = new Uint8Array(CELL_COUNT);
	const hollowGroupStart = svg.indexOf('<g fill="none"');
	const hollowFrom = hollowGroupStart === -1 ? Number.POSITIVE_INFINITY : hollowGroupStart;
	for (const circle of svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)"/g)) {
		const column = Math.floor(Number(circle[1]) / COVER_GRID.pitch);
		const row = Math.floor(Number(circle[2]) / COVER_GRID.pitch);
		if (column >= COVER_GRID.columns || row >= COVER_GRID.rows) continue;
		states[row * COVER_GRID.columns + column] = circle.index < hollowFrom ? DOT_FILLED : DOT_HOLLOW;
	}
	return states;
}

export function createCoverShader(scene: CoverScene) {
	const goo = createGooField(FIELD_WIDTH, FIELD_HEIGHT);
	const crisp = createGooField(FIELD_WIDTH, FIELD_HEIGHT);
	const scratch = new Float32Array(FIELD_WIDTH * FIELD_HEIGHT);
	const states = new Uint8Array(CELL_COUNT);
	// A scene is drawn from the morph and spin alone, so a frame that repeats both (a held or unspun cover) is unchanged.
	let lastMorph = Number.NaN;
	let lastSpin = Number.NaN;

	return (frame: DotMorphFrame) => {
		if (frame.morph === lastMorph && frame.spin === lastSpin) return states;
		lastMorph = frame.morph;
		lastSpin = frame.spin;
		clearGooField(goo, FIELD_SCALE);
		clearGooField(crisp, FIELD_SCALE);
		scene.draw({ goo: goo.context, crisp: crisp.context }, frame);
		readGooField(goo);
		readGooField(crisp);

		const sigma = scene.gooSigma(frame.morph) * FIELD_SCALE;
		if (sigma > 0.002) fuseGooField(goo, scratch, sigma);

		for (let row = 0; row < COVER_GRID.rows; row++) {
			for (let column = 0; column < COVER_GRID.columns; column++) {
				let coverage = 0;
				let darkness = 0;
				for (let sampleY = 0; sampleY < SAMPLES_PER_CELL; sampleY++) {
					const rowStart = (row * SAMPLES_PER_CELL + sampleY) * FIELD_WIDTH + column * SAMPLES_PER_CELL;
					for (let sampleX = 0; sampleX < SAMPLES_PER_CELL; sampleX++) {
						const pixel = rowStart + sampleX;
						const showsThrough = 1 - crisp.coverage[pixel];
						coverage += crisp.coverage[pixel] + goo.coverage[pixel] * showsThrough;
						darkness += crisp.darkness[pixel] + goo.darkness[pixel] * showsThrough;
					}
				}
				const cell = row * COVER_GRID.columns + column;
				states[cell] = coverage > 0 ? classify(cell, coverage / (SAMPLES_PER_CELL * SAMPLES_PER_CELL), darkness / coverage) : DOT_ABSENT;
			}
		}
		return states;
	};
}
