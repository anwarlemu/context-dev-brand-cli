import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';

/** A box of cells within a story's grid. */
export interface Region {
	left: number;
	top: number;
	columns: number;
	rows: number;
}

type CellPosition = Pick<GlyphCell, 'column' | 'row'>;

// Roughly one dot in six flips to the other state, the speckle the brand's dot shader gives its imagery.
const SPECKLE_RATE = 0.16;

function isSpeckled(column: number, row: number) {
	const hash = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
	return hash - Math.floor(hash) < SPECKLE_RATE;
}

/** Mostly rings or mostly solid dots, with the shader speckle flipping a few. */
export const isFilledAmongRings = isSpeckled;
export const isFilledAmongSolids = (column: number, row: number) => !isSpeckled(column, row);

export const placeCells = (cells: GlyphCell[], { left, top }: Pick<Region, 'left' | 'top'>): GlyphCell[] => cells.map((cell) => ({ ...cell, column: cell.column + left, row: cell.row + top }));

/** A region's border, one solid dot wide. */
export function outlineCells({ left, top, columns, rows }: Region): GlyphCell[] {
	const cells: GlyphCell[] = [];
	for (let row = top; row < top + rows; row++) {
		for (let column = left; column < left + columns; column++) {
			if (row === top || row === top + rows - 1 || column === left || column === left + columns - 1) cells.push({ column, row, filled: true });
		}
	}
	return cells;
}

export function fillCells({ left, top, columns, rows }: Region, filled: boolean): GlyphCell[] {
	return Array.from({ length: columns * rows }, (_, index) => ({ column: left + (index % columns), row: top + Math.floor(index / columns), filled }));
}

export const cellState = (cell: GlyphCell) => (cell.filled ? DOT_FILLED : DOT_HOLLOW);

export const cellIndexIn =
	({ columns }: DotGrid) =>
	({ column, row }: CellPosition) =>
		row * columns + column;

/** Later cells win where two land on the same dot. */
export function cellStates(grid: DotGrid, cells: GlyphCell[]) {
	const states = new Uint8Array(grid.columns * grid.rows);
	for (const cell of cells) states[cell.row * grid.columns + cell.column] = cellState(cell);
	return states;
}

export function cellsOfStates({ columns }: DotGrid, states: Uint8Array): GlyphCell[] {
	const cells: GlyphCell[] = [];
	states.forEach((state, index) => {
		if (state !== DOT_ABSENT) cells.push({ column: index % columns, row: Math.floor(index / columns), filled: state === DOT_FILLED });
	});
	return cells;
}

// The last dot of a reveal appears this far into it, leaving the rest for it to settle.
const RIPPLE_SHARE = 0.7;

/** Whether a reveal that is `progress` of the way through has reached a dot `share` of the way along it. */
export const hasRippleReached = (share: number, progress: number) => share * RIPPLE_SHARE <= progress;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const easeOut = (t: number) => 1 - (1 - t) ** 3;

type DotState = typeof DOT_ABSENT | typeof DOT_HOLLOW | typeof DOT_FILLED;

/** Says what one dot of a picture is; pictures are built by layering painters and then painting the grid with them. */
export type DotPainter = (column: number, row: number) => DotState;

export interface GridPoint {
	column: number;
	row: number;
}

export const LINE_WIDTH = 0.6;
// A dot exactly a line's width from a slanted edge lands on either side of it by rounding; this keeps mirrored shapes mirrored.
const ROUNDING_SLACK = 1e-6;

export function distanceToSegment(column: number, row: number, from: GridPoint, to: GridPoint) {
	const dx = to.column - from.column;
	const dy = to.row - from.row;
	const t = Math.max(0, Math.min(1, ((column - from.column) * dx + (row - from.row) * dy) / (dx * dx + dy * dy)));
	return Math.hypot(column - (from.column + t * dx), row - (from.row + t * dy));
}

export const ringsWithSpeckle: DotPainter = (column, row) => (isFilledAmongRings(column, row) ? DOT_FILLED : DOT_HOLLOW);
export const solidWithSpeckle: DotPainter = (column, row) => (isFilledAmongSolids(column, row) ? DOT_FILLED : DOT_HOLLOW);

/** A shape with a solid outline one dot wide, filled by `interior`. */
export function polygon(corners: GridPoint[], interior: DotPainter): DotPainter {
	const edges = corners.map((from, index) => ({ from, to: corners[(index + 1) % corners.length] }));
	return (column, row) => {
		if (edges.some(({ from, to }) => distanceToSegment(column, row, from, to) < LINE_WIDTH + ROUNDING_SLACK)) return DOT_FILLED;
		const crossings = edges.filter(({ from, to }) => from.row > row !== to.row > row && column < from.column + ((row - from.row) / (to.row - from.row)) * (to.column - from.column));
		return crossings.length % 2 === 1 ? interior(column, row) : DOT_ABSENT;
	};
}

export function rectangle({ left, right, top, bottom }: { left: number; right: number; top: number; bottom: number }, interior: DotPainter): DotPainter {
	return polygon(
		[
			{ column: left, row: top },
			{ column: right, row: top },
			{ column: right, row: bottom },
			{ column: left, row: bottom },
		],
		interior
	);
}

/** Front to back: the first layer that draws a dot wins. */
export function stack(...layers: DotPainter[]): DotPainter {
	return (column, row) => {
		for (const layer of layers) {
			const state = layer(column, row);
			if (state !== DOT_ABSENT) return state;
		}
		return DOT_ABSENT;
	};
}

export function paintedStates({ columns, rows }: DotGrid, painter: DotPainter) {
	const states = new Uint8Array(columns * rows);
	for (let cell = 0; cell < states.length; cell++) states[cell] = painter(cell % columns, Math.floor(cell / columns));
	return states;
}

/** A round shape with a solid outline one dot wide, filled by `interior`. */
export function disc(centre: GridPoint, radius: number, interior: DotPainter): DotPainter {
	return (column, row) => {
		const fromCentre = Math.hypot(column - centre.column, row - centre.row);
		if (fromCentre > radius + ROUNDING_SLACK) return DOT_ABSENT;
		return fromCentre > radius - 1 ? DOT_FILLED : interior(column, row);
	};
}

export const solid: DotPainter = () => DOT_FILLED;
export const rings: DotPainter = () => DOT_HOLLOW;
export const clear: DotPainter = () => DOT_ABSENT;

/** Paints `painter` only where `isInside` holds, so one shape can be cut to another. */
export const within =
	(isInside: (column: number, row: number) => boolean, painter: DotPainter): DotPainter =>
	(column, row) =>
		isInside(column, row) ? painter(column, row) : DOT_ABSENT;

export const isInRegion = ({ left, top, columns, rows }: Region, column: number, row: number) => column >= left && column < left + columns && row >= top && row < top + rows;

export type DotShape = (column: number, row: number) => boolean;

/** Paints `shape` into `states` with a solid outline one dot wide, filled by `interior`; dots outside it are left as they are. */
export function paintShape({ columns, rows }: DotGrid, states: Uint8Array, shape: DotShape, interior: DotPainter) {
	for (let row = 0; row < rows; row++) {
		for (let column = 0; column < columns; column++) {
			if (!shape(column, row)) continue;
			const isEdge = !shape(column - 1, row) || !shape(column + 1, row) || !shape(column, row - 1) || !shape(column, row + 1);
			states[row * columns + column] = isEdge ? DOT_FILLED : interior(column, row);
		}
	}
	return states;
}

export interface DotBox {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export const isInDotBox = ({ left, right, top, bottom }: DotBox, column: number, row: number) => column >= left && column <= right && row >= top && row <= bottom;

// A corner dot this far past the radius still belongs to the corner, which keeps small radii from looking clipped.
const CORNER_SLACK = 0.3;

/** A box with its corners rounded to `radius`. */
export const roundedBox =
	(box: DotBox, radius: number): DotShape =>
	(column, row) => {
		const across = Math.max(box.left + radius - column, 0, column - (box.right - radius));
		const down = Math.max(box.top + radius - row, 0, row - (box.bottom - radius));
		return isInDotBox(box, column, row) && Math.hypot(across, down) <= radius + CORNER_SLACK;
	};
