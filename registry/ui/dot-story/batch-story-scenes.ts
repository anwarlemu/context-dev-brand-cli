import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { cellStates, cellsOfStates, fillCells, outlineCells, paintedStates, placeCells, polygon, rectangle, ringsWithSpeckle, solidWithSpeckle, stack, type DotPainter, type Region } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Run batches at scale" card's pictures, in the brand dot grid: a job counts its way through 25,000 URLs, then
 * becomes its results, a page of them and the box they are packed into as one dataset.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const BATCH_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, pitch: PITCH } = BATCH_STORY_GRID;
const x = (column: number) => column * PITCH;
const y = (row: number) => row * PITCH;

export interface StoryPicture {
	states: Uint8Array;
	cells: GlyphCell[];
}

const pictureOf = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(BATCH_STORY_GRID, states) });
const painted = (painter: DotPainter) => pictureOf(paintedStates(BATCH_STORY_GRID, painter));

export const BATCH_SIZE = 25000;
/** One dot per share of the batch, filled in reading order as the job runs. */
export const PROGRESS: Region = { left: 4, top: 20, columns: 50, rows: 8 };
export const PROGRESS_CELLS = fillCells(PROGRESS, false);
export const EMPTY_PROGRESS = pictureOf(cellStates(BATCH_STORY_GRID, PROGRESS_CELLS));
export const FULL_PROGRESS = pictureOf(cellStates(BATCH_STORY_GRID, fillCells(PROGRESS, true)));
export const COUNTER: DotStoryText = { text: `${BATCH_SIZE.toLocaleString('en-US')} URLs`, x: x(COLUMNS / 2), y: y(15), size: 64, weight: 800, anchor: 'middle' };

const PAGE_SIZE = { columns: 12, rows: 14 };
const PAGE_LINES = [
	{ row: 2, columns: 5, filled: true },
	{ row: 5, columns: 8, filled: false },
	{ row: 7, columns: 6, filled: false },
	{ row: 9, columns: 8, filled: false },
	{ row: 11, columns: 4, filled: false },
];
/**
 * A page of results, drawn from its own top-left corner so it can be set down anywhere on its way into the box. Its
 * paper is the dots it clears rather than draws, so whatever the page passes in front of never shows through it.
 */
export const RESULTS_PAGE = {
	paper: fillCells({ left: 1, top: 1, columns: PAGE_SIZE.columns - 2, rows: PAGE_SIZE.rows - 2 }, false),
	ink: [...outlineCells({ left: 0, top: 0, ...PAGE_SIZE }), ...PAGE_LINES.flatMap(({ row, columns, filled }) => Array.from({ length: columns }, (_, step) => ({ column: 2 + step, row, filled })))],
};

const BOX = { left: 33, right: 54, top: 21, bottom: 36 };
const LID = { left: BOX.left - 1, right: BOX.right + 1, top: BOX.top - 5, bottom: BOX.top - 1 };
const MIDDLE = (BOX.left + BOX.right) / 2;
const TAPE_COLUMNS = [Math.floor(MIDDLE), Math.ceil(MIDDLE)];
const TAPE_BOTTOM = BOX.top + 5;
const OPENING_DEPTH = 4;
const OPENING_INSET = 3;
const FLAP_REACH = 3;
const OPENING_BACK = BOX.top - OPENING_DEPTH;

export const BOX_RIM_ROW = BOX.top;
/** Where the page starts, where it hangs over the box, and where it comes to rest inside it, by its top-left corner. */
export const PAGE_STOPS = {
	start: { column: 8, row: 12 },
	over: { column: BOX.left + Math.floor((BOX.right - BOX.left + 1 - PAGE_SIZE.columns) / 2), row: 3 },
	packed: { column: BOX.left + Math.floor((BOX.right - BOX.left + 1 - PAGE_SIZE.columns) / 2), row: BOX.top + 1 },
};

const onTape = (column: number) => TAPE_COLUMNS.includes(column);

const boxFront: DotPainter = (column, row) => {
	const front = rectangle(BOX, solidWithSpeckle)(column, row);
	if (front === DOT_ABSENT) return DOT_ABSENT;
	return onTape(column) && row > BOX.top && row <= TAPE_BOTTOM ? DOT_HOLLOW : front;
};

const closedLid: DotPainter = (column, row) => {
	const lid = rectangle(LID, ringsWithSpeckle)(column, row);
	return lid !== DOT_ABSENT && onTape(column) ? DOT_FILLED : lid;
};

const opening = polygon(
	[
		{ column: BOX.left, row: BOX.top },
		{ column: BOX.right, row: BOX.top },
		{ column: BOX.right - OPENING_INSET, row: OPENING_BACK },
		{ column: BOX.left + OPENING_INSET, row: OPENING_BACK },
	],
	ringsWithSpeckle
);

function sideFlap(hinge: number, outwards: 1 | -1) {
	return polygon(
		[
			{ column: hinge, row: BOX.top },
			{ column: hinge - outwards * OPENING_INSET, row: OPENING_BACK },
			{ column: hinge - outwards * OPENING_INSET + outwards * FLAP_REACH, row: OPENING_BACK - FLAP_REACH },
			{ column: hinge + outwards * FLAP_REACH, row: BOX.top - FLAP_REACH },
		],
		ringsWithSpeckle
	);
}

/** The open box in two layers, so the page can pass between them: in front of the back wall, behind the front. */
export const BOX_FRONT = painted(boxFront);
export const BOX_BACK = painted(stack(sideFlap(BOX.left, -1), sideFlap(BOX.right, 1), opening));
export const OPEN_BOX = painted(stack(boxFront, sideFlap(BOX.left, -1), sideFlap(BOX.right, 1), opening));
// The lid's shadow: the front's top edge drops out under the closed lid.
export const CLOSED_BOX = painted((column, row) => (row === BOX.top ? DOT_ABSENT : stack(closedLid, boxFront)(column, row)));

/** How far the closed box travels, in columns, to stand in the middle of the picture. */
export const BOX_SHIFT = Math.round((COLUMNS - 1) / 2 - MIDDLE);
export const CENTRED_BOX = pictureOf(cellStates(BATCH_STORY_GRID, placeCells(CLOSED_BOX.cells, { left: BOX_SHIFT, top: 0 })));

const SUMMARY_BOTTOM = LID.top - 2;
export const SUMMARY: DotStoryText[] = [
	{ text: COUNTER.text, x: x(COLUMNS / 2), y: y(SUMMARY_BOTTOM - 3), size: 28, weight: 800, anchor: 'middle' },
	{ text: 'One dataset', x: x(COLUMNS / 2), y: y(SUMMARY_BOTTOM), size: 18, weight: 700, muted: true, anchor: 'middle' },
];

/** The batch packed: what the picture shows before it plays, and instead of playing with reduced motion. */
export const BATCH_RESTING = { ...CENTRED_BOX, texts: SUMMARY };
