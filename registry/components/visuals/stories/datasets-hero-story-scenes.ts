import { HERO_STORY_GRID, between, blankScreen, heroCaption, pictureOfStates } from '@/components/visuals/stories/hero-story-kit';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/visuals/dot-engine/dot-morph-dots';
import { paintShape, roundedBox, type DotBox } from '@/components/visuals/dot-engine/dot-story-cells';

/**
 * The datasets hero's pictures, in the brand dot grid: a spread of source documents collected one at a time, and
 * the table they are delivered as, filling a row at a time.
 */

// Back to front: each source overlaps the one before it.
const SOURCES: DotBox[] = [
	{ left: 3, right: 14, top: 4, bottom: 20 },
	{ left: 10, right: 21, top: 10, bottom: 26 },
	{ left: 17, right: 28, top: 16, bottom: 32 },
];
export const SOURCE_COUNT = SOURCES.length;
const SOURCE_LINE = { firstRow: 3, every: 3, inset: 2 };
const SOURCE_LINE_SHORTFALLS = [0, 2, 0, 3, 1];

/** The sources with the first `collected` of them read: a collected source's lines are solid, the rest rings. */
export function paintSources(states: Uint8Array, collected: number) {
	SOURCES.forEach((source, index) => {
		paintShape(HERO_STORY_GRID, states, roundedBox(source, 1), (column, row) => {
			const line = (row - source.top - SOURCE_LINE.firstRow) / SOURCE_LINE.every;
			if (!Number.isInteger(line) || !between(line, 0, SOURCE_LINE_SHORTFALLS.length - 1) || row >= source.bottom - 1) return DOT_ABSENT;
			if (!between(column, source.left + SOURCE_LINE.inset, source.right - SOURCE_LINE.inset - SOURCE_LINE_SHORTFALLS[line])) return DOT_ABSENT;
			return index < collected ? DOT_FILLED : DOT_HOLLOW;
		});
	});
	return states;
}

export const SOURCES_UNREAD = pictureOfStates(paintSources(blankScreen(), 0));
export const SOURCES_COLLECTED = pictureOfStates(paintSources(blankScreen(), SOURCE_COUNT));

const TABLE: DotBox = { left: 3, right: 29, top: 5, bottom: 33 };
const HEADER_ROWS = [7, 8];
const TABLE_COLUMNS = [
	{ left: 5, right: 10 },
	{ left: 13, right: 18 },
	{ left: 21, right: 27 },
];
const RECORD = { firstRow: 12, every: 3 };
// How far short of its column each record's three values stop.
const RECORD_SHORTFALLS = [
	[0, 2, 1],
	[2, 0, 3],
	[1, 1, 0],
	[0, 3, 2],
	[3, 0, 1],
	[1, 2, 0],
	[0, 1, 4],
];
export const RECORD_COUNT = RECORD_SHORTFALLS.length;

/** The table with its first `filled` records in: solid headings over rows of rings. */
export function paintDataset(states: Uint8Array, filled: number) {
	return paintShape(HERO_STORY_GRID, states, roundedBox(TABLE, 2), (column, row) => {
		const tableColumn = TABLE_COLUMNS.findIndex(({ left, right }) => between(column, left, right));
		if (tableColumn === -1) return DOT_ABSENT;
		if (HEADER_ROWS.includes(row)) return DOT_FILLED;
		const record = (row - RECORD.firstRow) / RECORD.every;
		if (!Number.isInteger(record) || !between(record, 0, filled - 1)) return DOT_ABSENT;
		return column <= TABLE_COLUMNS[tableColumn].right - RECORD_SHORTFALLS[record][tableColumn] ? DOT_HOLLOW : DOT_ABSENT;
	});
}

export const DATASET_EMPTY = pictureOfStates(paintDataset(blankScreen(), 0));
export const DATASET_FILLED = pictureOfStates(paintDataset(blankScreen(), RECORD_COUNT));

export const DATASETS_CAPTIONS = {
	sources: heroCaption('your engineer collects', 'sources', 'archives, catalogs, portals'),
	dataset: heroCaption('delivered as a', 'dataset', 'CSV, JSON or an API'),
};

/** The finished dataset: what the picture shows before it plays, and instead of playing with reduced motion. */
export const DATASETS_RESTING = { ...DATASET_FILLED, texts: DATASETS_CAPTIONS.dataset };
