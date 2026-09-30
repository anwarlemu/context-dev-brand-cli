import { storyCaption } from '@/components/ds/ui/story-caption';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, paintShape, roundedBox, type DotBox } from '@/components/ds/ui/dot-story-cells';

/**
 * The "Massive URL lists" card's pictures, in the brand dot grid: a long list of URLs running up its sheet as they
 * are submitted, and one of those URLs up close, with the identifier and metadata it carries.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const URL_LIST_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = URL_LIST_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(URL_LIST_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const SHEET: DotBox = { left: 5, right: 27, top: 2, bottom: 35 };
const ITEM = { every: 3, bullet: 8, from: 10, ends: [24, 19, 22] };
/** How far the list runs before it looks the same again. */
export const LIST_REPEATS_EVERY = ITEM.every * ITEM.ends.length;

/** The list run `run` rows up its sheet: each URL a solid bullet and a line of rings. */
export function paintList(states: Uint8Array, run: number) {
	return paintShape(URL_LIST_STORY_GRID, states, roundedBox(SHEET, 2), (column, row) => {
		const line = row + Math.floor(run);
		if (line % ITEM.every !== 0 || row <= SHEET.top + 1 || row >= SHEET.bottom - 1) return DOT_ABSENT;
		if (column === ITEM.bullet) return DOT_FILLED;
		return between(column, ITEM.from, ITEM.ends[(line / ITEM.every) % ITEM.ends.length]) ? DOT_HOLLOW : DOT_ABSENT;
	});
}

export const LIST_AT_REST = pictureOfStates(paintList(blank(), 0));

const ENTRY: DotBox = { left: 3, right: 29, top: 8, bottom: 29 };
const ENTRY_URL = { rows: [11, 12], left: 6, right: 24 };
const TAGS: DotBox[] = [
	{ left: 6, right: 15, top: 17, bottom: 21 },
	{ left: 17, right: 26, top: 17, bottom: 21 },
];
const TAG_LABEL_ROW = 19;
const ENTRY_NOTE = { row: 25, left: 6, right: 20 };

/** One URL up close, with its first `tagged` tags set: a set tag is solid with its label cut out, an unset one rings. */
export function paintEntry(states: Uint8Array, tagged: number) {
	paintShape(URL_LIST_STORY_GRID, states, roundedBox(ENTRY, 2), (column, row) => {
		if (ENTRY_URL.rows.includes(row) && between(column, ENTRY_URL.left, ENTRY_URL.right)) return DOT_FILLED;
		return row === ENTRY_NOTE.row && between(column, ENTRY_NOTE.left, ENTRY_NOTE.right) ? DOT_HOLLOW : DOT_ABSENT;
	});
	TAGS.forEach((tag, index) => {
		paintShape(URL_LIST_STORY_GRID, states, roundedBox(tag, 2), (column, row) => (index < tagged && !(row === TAG_LABEL_ROW && between(column, tag.left + 2, tag.right - 2)) ? DOT_FILLED : DOT_HOLLOW));
	});
	return states;
}

export const TAG_COUNT = TAGS.length;
export const ENTRY_UNTAGGED = pictureOfStates(paintEntry(blank(), 0));
export const ENTRY_TAGGED = pictureOfStates(paintEntry(blank(), TAG_COUNT));

export const BATCH_LIMIT = 25_000;
const caption = (label: string, value: string, detail: string) => storyCaption(URL_LIST_STORY_GRID, 34, label, value, detail);
export const CAPTIONS = {
	list: caption('one batch', BATCH_LIMIT.toLocaleString('en-US'), 'URLs in a single request'),
	entry: caption('each URL keeps', 'your id', 'and your own metadata'),
};

/** The tagged URL: what the picture shows before it plays, and instead of playing with reduced motion. */
export const URL_LIST_RESTING = { ...ENTRY_TAGGED, texts: CAPTIONS.entry };
