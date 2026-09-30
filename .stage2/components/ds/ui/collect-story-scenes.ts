import { storyCaption } from '@/components/ds/ui/story-caption';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, paintShape, polygon, roundedBox, solidWithSpeckle, type DotBox, type DotShape } from '@/components/ds/ui/dot-story-cells';

/**
 * The "Collect the dataset" card's pictures, in the brand dot grid: a ring that fills as the job runs, the results
 * a page at a time, and the paper plane of the webhook sent when the job is done.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const COLLECT_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = COLLECT_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(COLLECT_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const RING = { centre: { column: 16, row: 19 }, outer: 13.4, inner: 7.6 };
const isRing: DotShape = (column, row) => between(Math.hypot(column - RING.centre.column, row - RING.centre.row), RING.inner, RING.outer);

/** The progress ring with `done` of it filled, clockwise from the top. */
export function paintProgress(states: Uint8Array, done: number) {
	return paintShape(COLLECT_STORY_GRID, states, isRing, (column, row) => {
		const round = (Math.atan2(column - RING.centre.column, RING.centre.row - row) / (Math.PI * 2) + 1) % 1;
		return round < done ? DOT_FILLED : DOT_HOLLOW;
	});
}

export const PROGRESS_EMPTY = pictureOfStates(paintProgress(blank(), 0));
export const PROGRESS_DONE = pictureOfStates(paintProgress(blank(), 1));

const TABLE: DotBox = { left: 4, right: 28, top: 3, bottom: 34 };
const TABLE_PARTS = { header: [5, 6], rows: [10, 13, 16, 19, 22, 25], key: { left: 7, right: 9 }, value: { left: 12, shortest: 17, spread: 9 }, pager: { row: 30, columns: [10, 13, 16, 19, 22] } };

/** The results table turned to `page`: each page has its own rows, and its dot in the pager below is the solid one. */
export function paintResults(states: Uint8Array, page: number) {
	return paintShape(COLLECT_STORY_GRID, states, roundedBox(TABLE, 2), (column, row) => {
		if (TABLE_PARTS.header.includes(row)) return between(column, TABLE.left + 3, TABLE.right - 3) ? DOT_FILLED : DOT_ABSENT;
		if (row === TABLE_PARTS.pager.row) return TABLE_PARTS.pager.columns.includes(column) ? (TABLE_PARTS.pager.columns[page] === column ? DOT_FILLED : DOT_HOLLOW) : DOT_ABSENT;
		const line = TABLE_PARTS.rows.indexOf(row);
		if (line < 0) return DOT_ABSENT;
		if (between(column, TABLE_PARTS.key.left, TABLE_PARTS.key.right)) return DOT_FILLED;
		const valueEnds = TABLE_PARTS.value.shortest + ((line * 5 + page * 7) % TABLE_PARTS.value.spread);
		return between(column, TABLE_PARTS.value.left, valueEnds) ? DOT_HOLLOW : DOT_ABSENT;
	});
}

export const PAGES_SHOWN = 3;
export const RESULTS_FIRST_PAGE = pictureOfStates(paintResults(blank(), 0));
export const RESULTS_LAST_PAGE = pictureOfStates(paintResults(blank(), PAGES_SHOWN - 1));

const PLANE = { nose: { column: 30, row: 7 }, wing: { column: 2, row: 17 }, fold: { column: 12, row: 22 }, tail: { column: 15, row: 31 }, keel: { column: 17, row: 24 }, under: { column: 25, row: 28 } };
// A paper plane, nose up and to the right: its upper wing solid, the wing folded under it in rings.
const paperPlane = polygon([PLANE.nose, PLANE.wing, PLANE.fold, PLANE.tail, PLANE.keel, PLANE.under], (column, row) => {
	const foldRow = PLANE.fold.row + ((PLANE.nose.row - PLANE.fold.row) * (column - PLANE.fold.column)) / (PLANE.nose.column - PLANE.fold.column);
	if (Math.abs(row - foldRow) < 0.6 && column >= PLANE.fold.column) return DOT_FILLED;
	return row < foldRow ? solidWithSpeckle(column, row) : DOT_HOLLOW;
});

export const WEBHOOK_PLANE = pictureOf(COLLECT_STORY_GRID, paperPlane);

const caption = (label: string, value: string, detail: string) => storyCaption(COLLECT_STORY_GRID, 34, label, value, detail);
export const CAPTIONS = {
	progress: caption('job status', '0%', 'running'),
	results: caption('results', 'page 1', '1,000 results a page'),
	webhook: caption('webhook', 'sent', 'batch completed'),
};

/** The full ring: what the picture shows before it plays, and instead of playing with reduced motion. */
export const COLLECT_RESTING = { ...PROGRESS_DONE, texts: [CAPTIONS.progress[0], { ...CAPTIONS.progress[1], text: '100%' }, { ...CAPTIONS.progress[2], text: 'completed' }] };
