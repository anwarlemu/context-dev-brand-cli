import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { clearGooField, createGooField, fuseGooField, readGooField } from '@/components/ds/ui/dot-morph-goo';
import type { DotMorphFrame } from '@/components/ds/ui/dot-morph-player';

/**
 * Melts a glyph made of dots into a drawn shape. The glyph and the shape share one small raster that is blurred and
 * re-cut, so one flows into the other rather than cross-fading.
 */

export interface GlyphMorph {
	grid: DotGrid;
	/** The glyph's square box within the grid, in cells. */
	box: { left: number; top: number; cellsPerSide: number };
	cells: GlyphCell[];
	/**
	 * Draws the shape the glyph becomes, in grid units from the box's top-left corner. Black draws filled dots, white
	 * draws hollow ones. It is asked for every frame, so it can keep moving once the morph has arrived.
	 */
	drawTarget: (context: CanvasRenderingContext2D, frame: DotMorphFrame) => void;
}

// The melt spills a little past the glyph's own box on its way to the new shape.
const MARGIN_CELLS = 4;
const SAMPLES_PER_CELL = 2;
const PRESENT_AT = 0.5;
const FILLED_AT = 0.5;
const GOO_SIGMA_IN_CELLS = 1.4;
const RETREAT_SCALE = 0.78;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const phase = (morph: number, start: number, end: number) => clamp01((morph - start) / (end - start));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** How far the new shape has taken over from the glyph; a target can use it to time its own entrance. */
export const glyphHandover = (morph: number) => easeInOut(phase(morph, 0.3, 0.75));

export function drawGlyphCells(context: CanvasRenderingContext2D, cells: GlyphCell[], pitch: number) {
	for (const cell of cells) {
		context.fillStyle = cell.filled ? '#000' : '#fff';
		context.fillRect(cell.column * pitch, cell.row * pitch, pitch, pitch);
	}
}

export function glyphRestingDots({ grid, box, cells }: GlyphMorph) {
	const states = new Uint8Array(grid.columns * grid.rows);
	for (const cell of cells) states[(cell.row + box.top) * grid.columns + cell.column + box.left] = cell.filled ? DOT_FILLED : DOT_HOLLOW;
	return states;
}

export function createGlyphShader({ grid, box, cells, drawTarget }: GlyphMorph) {
	const { pitch } = grid;
	const fieldCells = box.cellsPerSide + MARGIN_CELLS * 2;
	const fieldSize = fieldCells * SAMPLES_PER_CELL;
	const fieldScale = SAMPLES_PER_CELL / pitch;
	const boxCenter = (box.cellsPerSide * pitch) / 2;
	const field = createGooField(fieldSize, fieldSize);
	const scratch = new Float32Array(fieldSize * fieldSize);
	const states = new Uint8Array(grid.columns * grid.rows);
	const samples = SAMPLES_PER_CELL * SAMPLES_PER_CELL;

	const drawGlyph = (morph: number) => {
		const scale = 1 + (RETREAT_SCALE - 1) * easeInOut(phase(morph, 0.05, 0.6));
		field.context.save();
		field.context.globalAlpha = 1 - glyphHandover(morph);
		field.context.translate(boxCenter, boxCenter);
		field.context.scale(scale, scale);
		field.context.translate(-boxCenter, -boxCenter);
		drawGlyphCells(field.context, cells, pitch);
		field.context.restore();
	};

	return (frame: DotMorphFrame) => {
		clearGooField(field, fieldScale);
		field.context.translate(MARGIN_CELLS * pitch, MARGIN_CELLS * pitch);
		drawGlyph(frame.morph);
		field.context.save();
		field.context.globalAlpha = glyphHandover(frame.morph);
		drawTarget(field.context, frame);
		field.context.restore();
		readGooField(field);
		const sigma = GOO_SIGMA_IN_CELLS * SAMPLES_PER_CELL * Math.sin(Math.PI * phase(frame.morph, 0.05, 0.95));
		if (sigma > 0.002) fuseGooField(field, scratch, sigma);

		states.fill(DOT_ABSENT);
		for (let fieldRow = 0; fieldRow < fieldCells; fieldRow++) {
			const row = fieldRow - MARGIN_CELLS + box.top;
			if (row < 0 || row >= grid.rows) continue;
			for (let fieldColumn = 0; fieldColumn < fieldCells; fieldColumn++) {
				const column = fieldColumn - MARGIN_CELLS + box.left;
				if (column < 0 || column >= grid.columns) continue;
				let coverage = 0;
				let darkness = 0;
				for (let sampleY = 0; sampleY < SAMPLES_PER_CELL; sampleY++) {
					const rowStart = (fieldRow * SAMPLES_PER_CELL + sampleY) * fieldSize + fieldColumn * SAMPLES_PER_CELL;
					for (let sampleX = 0; sampleX < SAMPLES_PER_CELL; sampleX++) {
						coverage += field.coverage[rowStart + sampleX];
						darkness += field.darkness[rowStart + sampleX];
					}
				}
				if (coverage / samples < PRESENT_AT) continue;
				states[row * grid.columns + column] = darkness / coverage >= FILLED_AT ? DOT_FILLED : DOT_HOLLOW;
			}
		}
		return states;
	};
}
