import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/visuals/dot-engine/dot-story-beats';
import { cellStates, cellsOfStates, fillCells, rectangle, ringsWithSpeckle, solidWithSpeckle, stack, type DotPainter, type Region } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryText } from '@/components/visuals/dot-engine/dot-story-player';

/**
 * The Batches empty state's pictures, ported from the website's Research and "Run batches at scale" cards: the
 * sources a batch reads, then the job counting its way through its URLs while its progress fills dot by dot.
 */

export const BATCHES_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, pitch: PITCH } = BATCHES_STORY_GRID;
const x = (column: number) => column * PITCH;
const y = (row: number) => row * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;

const BOOK = { columns: 40, rows: 8, spine: 4, pages: 3 };
const BOOKS = [
	{ left: 10, top: 3, isDark: true },
	{ left: 7, top: 13, isDark: false },
	{ left: 11, top: 23, isDark: true },
];

// A book lying flat: a solid spine, the page edges as rings at its other end, and a title band across its cover.
const book = ({ left, top, isDark }: (typeof BOOKS)[number]): DotPainter =>
	rectangle({ left, right: left + BOOK.columns - 1, top, bottom: top + BOOK.rows - 1 }, (column, row) => {
		if (column < left + BOOK.spine) return DOT_FILLED;
		if (column >= left + BOOK.columns - BOOK.pages) return row % 2 === 0 ? DOT_HOLLOW : DOT_ABSENT;
		const isTitle = (row === top + 3 || row === top + 4) && column >= left + BOOK.spine + 4 && column < left + BOOK.spine + 20;
		if (isTitle) return isDark ? DOT_HOLLOW : DOT_FILLED;
		return isDark ? solidWithSpeckle(column, row) : ringsWithSpeckle(column, row);
	});

export const SOURCES = pictureOf(BATCHES_STORY_GRID, stack(...BOOKS.map(book)));
export const SOURCES_LABEL: DotStoryText = { text: 'Reading 3 sources', x: x(COLUMNS / 2), y: baselineOn(34, 18), size: 18, weight: 700, muted: true, anchor: 'middle' };

const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(BATCHES_STORY_GRID, states) });

export const BATCH_SIZE = 25000;
/** One dot per share of the batch, filled in reading order as the job runs. */
const PROGRESS: Region = { left: 4, top: 20, columns: 50, rows: 8 };
export const PROGRESS_CELLS = fillCells(PROGRESS, false);
export const EMPTY_PROGRESS = pictureOfStates(cellStates(BATCHES_STORY_GRID, PROGRESS_CELLS));
export const FULL_PROGRESS = pictureOfStates(cellStates(BATCHES_STORY_GRID, fillCells(PROGRESS, true)));
export const COUNTER: DotStoryText = { text: `${BATCH_SIZE.toLocaleString('en-US')} URLs`, x: x(COLUMNS / 2), y: y(15), size: 64, weight: 800, anchor: 'middle' };

/** The sources being read: what the picture shows before it plays, and instead of playing with reduced motion. */
export const BATCHES_RESTING = { cells: SOURCES.cells, texts: [SOURCES_LABEL] };
