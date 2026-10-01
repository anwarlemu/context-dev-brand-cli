import { storyCaption } from '@/components/ds/ui/story-caption';
import { promptField } from '@/components/ds/ui/prompt-field';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, paintShape, roundedBox, solidWithSpeckle, type DotBox } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The pictures for the three ways to watch a website, in the brand dot grid. A page monitor: a page re-scraped until
 * one of its lines changes, and the exact diff of that line. A sitemap monitor: a list of URLs that loses one and
 * gains one, and the new page. An extract monitor: what to watch, said in plain words, and the fields read from the
 * page with how sure the monitor is that one of them changed.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const MONITOR_WAYS_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = MONITOR_WAYS_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(MONITOR_WAYS_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;
const caption = (label: string, value: string, detail: string) => storyCaption(MONITOR_WAYS_GRID, 34, label, value, detail);

const SHEET: DotBox = { left: 4, right: 26, top: 3, bottom: 34 };
const PAGE = { title: { rows: [6, 7], right: 16 }, left: 7, lines: [{ row: 11, right: 22 }, { row: 13, right: 19 }, { row: 15, right: 21 }, { row: 24, right: 22 }, { row: 26, right: 18 }, { row: 28, right: 21 }, { row: 30, right: 15 }], changed: { rows: [19, 20], right: 20 } };

/** The watched page with a scan `scanned` of the way down it (none at 0 or 1); once changed, one line of it is solid. */
export function paintWatchedPage(states: Uint8Array, scanned: number, isChanged: boolean) {
	const bar = SHEET.top + 1 + Math.round(scanned * (SHEET.bottom - SHEET.top - 2));
	return paintShape(MONITOR_WAYS_GRID, states, roundedBox(SHEET, 2), (column, row) => {
		if (scanned > 0 && scanned < 1 && row === bar) return DOT_FILLED;
		if (!between(column, PAGE.left, SHEET.right - 3)) return DOT_ABSENT;
		if (PAGE.title.rows.includes(row)) return column <= PAGE.title.right ? DOT_FILLED : DOT_ABSENT;
		if (PAGE.changed.rows.includes(row)) return column > PAGE.changed.right ? DOT_ABSENT : isChanged ? DOT_FILLED : row === PAGE.changed.rows[0] ? DOT_HOLLOW : DOT_ABSENT;
		return PAGE.lines.some((line) => line.row === row && column <= line.right) ? DOT_HOLLOW : DOT_ABSENT;
	});
}

export const PAGE_UNCHANGED = pictureOfStates(paintWatchedPage(blank(), 0, false));
export const PAGE_CHANGED = pictureOfStates(paintWatchedPage(blank(), 0, true));

const DIFF = { left: 2, right: 30, tab: 6, removed: { top: 9, bottom: 16 }, added: { top: 21, bottom: 28 } };
// The line as it was, in rings behind a minus, and as it is now, solid behind a plus: each sign cut out of its tab.
const diffLine = (states: Uint8Array, { top, bottom }: { top: number; bottom: number }, isAdded: boolean) =>
	paintShape(MONITOR_WAYS_GRID, states, roundedBox({ left: DIFF.left, right: DIFF.right, top, bottom }, 2), (column, row) => {
		const middle = (top + bottom) / 2;
		const tabCentre = DIFF.left + DIFF.tab / 2;
		if (column <= DIFF.left + DIFF.tab) {
			const isBar = Math.abs(row - middle) < 1 && Math.abs(column - tabCentre) <= 2;
			const isStem = isAdded && Math.abs(column - tabCentre) < 1 && Math.abs(row - middle) <= 2.5;
			return isBar || isStem ? DOT_HOLLOW : DOT_FILLED;
		}
		return isAdded ? solidWithSpeckle(column, row) : DOT_HOLLOW;
	});

export const TEXT_DIFF = pictureOfStates(diffLine(diffLine(blank(), DIFF.removed, false), DIFF.added, true));

export const PAGE_CAPTIONS = {
	watching: caption('every hour', 're-scrape', 'one URL, its visible text'),
	changed: caption('exact diff', '1 line', '$49 -> $59 a month'),
};

const LIST = { left: 3, right: 28, tab: 4, rowHeight: 4, every: 5, top: 4, count: 6, removed: 2, added: 5 };
const listRow = (index: number): DotBox => ({ left: LIST.left, right: LIST.right, top: LIST.top + index * LIST.every, bottom: LIST.top + index * LIST.every + LIST.rowHeight - 1 });

/** The sitemap's URLs. `isRemoved` empties the one that was delisted; `isAdded` brings in the new one, solid. */
export function paintSitemapList(states: Uint8Array, isRemoved: boolean, isAdded: boolean) {
	states.fill(DOT_ABSENT);
	for (let index = 0; index < LIST.count; index++) {
		if (index === LIST.added && !isAdded) continue;
		const box = listRow(index);
		paintShape(MONITOR_WAYS_GRID, states, roundedBox(box, 1), (column) => {
			if (index === LIST.removed && isRemoved) return DOT_ABSENT;
			if (column <= box.left + LIST.tab) return DOT_FILLED;
			return index === LIST.added ? DOT_FILLED : DOT_HOLLOW;
		});
	}
	return states;
}

export const SITEMAP_BEFORE = pictureOfStates(paintSitemapList(blank(), false, false));
export const SITEMAP_AFTER = pictureOfStates(paintSitemapList(blank(), true, true));

const NEW_PAGE = { plus: { column: 23, row: 28, radius: 5.4, arm: 3, width: 0.8 }, title: { rows: [7, 8], right: 17 }, lines: [{ row: 12, right: 22 }, { row: 14, right: 20 }, { row: 16, right: 22 }, { row: 18, right: 15 }] };
const newPageStates = paintShape(MONITOR_WAYS_GRID, blank(), roundedBox(SHEET, 2), (column, row) => {
	if (!between(column, PAGE.left, SHEET.right - 3)) return DOT_ABSENT;
	if (NEW_PAGE.title.rows.includes(row)) return column <= NEW_PAGE.title.right ? DOT_FILLED : DOT_ABSENT;
	return NEW_PAGE.lines.some((line) => line.row === row && column <= line.right) ? DOT_HOLLOW : DOT_ABSENT;
});
// The new page wears a solid badge with a plus cut out of it.
paintShape(
	MONITOR_WAYS_GRID,
	newPageStates,
	(column, row) => Math.hypot(column - NEW_PAGE.plus.column, row - NEW_PAGE.plus.row) <= NEW_PAGE.plus.radius,
	(column, row) => {
		const across = Math.abs(column - NEW_PAGE.plus.column);
		const down = Math.abs(row - NEW_PAGE.plus.row);
		return (across < NEW_PAGE.plus.width && down <= NEW_PAGE.plus.arm) || (down < NEW_PAGE.plus.width && across <= NEW_PAGE.plus.arm) ? DOT_HOLLOW : DOT_FILLED;
	}
);
export const NEW_PAGE_PICTURE = pictureOfStates(newPageStates);

export const SITEMAP_CAPTIONS = {
	watching: caption('sitemap.xml', '128 URLs', 'checked on a schedule'),
	changed: caption('sitemap.xml', '+1  -1', 'one added, one removed'),
	added: caption('new URL', 'added', '/products/atlas-pro'),
};

const PROMPT: DotBox = { left: 5, right: 52, top: 13, bottom: 23 };
const FIELD = promptField(MONITOR_WAYS_GRID, PROMPT);
export const PROMPT_FIELD = FIELD.empty;
export const PROMPT_FILLED = FIELD.filled;
export const alongPrompt = FIELD.along;
export const PROMPT_TEXT: DotStoryText = { text: 'track pricing plans', x: x(PROMPT.left + 4), y: baselineOn((PROMPT.top + PROMPT.bottom) / 2, 22), size: 22, weight: 700 };

const RECORD: DotBox = { left: 3, right: 29, top: 4, bottom: 33 };
const FIELDS = { rows: [8, 12, 16], key: { left: 6, right: 11 }, value: { left: 14, ends: [25, 21, 24] }, changed: 1 };
const METER = { row: 25, rows: 3, left: 6, segments: 10, every: 2 };

/** The record read from the page, and under it a meter with `confident` of its segments filled; the changed field is solid. */
export function paintRecord(states: Uint8Array, confident: number) {
	return paintShape(MONITOR_WAYS_GRID, states, roundedBox(RECORD, 2), (column, row) => {
		const field = FIELDS.rows.findIndex((fieldRow) => row === fieldRow || row === fieldRow + 1);
		if (field >= 0) {
			if (between(column, FIELDS.key.left, FIELDS.key.right)) return row === FIELDS.rows[field] ? DOT_HOLLOW : DOT_ABSENT;
			if (!between(column, FIELDS.value.left, FIELDS.value.ends[field])) return DOT_ABSENT;
			return field === FIELDS.changed ? DOT_FILLED : row === FIELDS.rows[field] ? DOT_HOLLOW : DOT_ABSENT;
		}
		if (row === METER.row - 4) return DOT_HOLLOW;
		const segment = (column - METER.left) / METER.every;
		if (!between(row, METER.row, METER.row + METER.rows - 1) || !Number.isInteger(segment) || !between(segment, 0, METER.segments - 1)) return DOT_ABSENT;
		return segment < confident ? DOT_FILLED : DOT_HOLLOW;
	});
}

/** How many of the meter's segments fill: the monitor is 0.9 sure the change is a real one. */
export const CONFIDENT_SEGMENTS = 9;
export const METER_SEGMENTS = METER.segments;
export const RECORD_UNSCORED = pictureOfStates(paintRecord(blank(), 0));
export const RECORD_SCORED = pictureOfStates(paintRecord(blank(), CONFIDENT_SEGMENTS));
export const EXTRACT_CAPTION = caption('confidence', '0.90', 'Team plan: $49 -> $59');

export const PAGE_MONITOR_RESTING = { ...TEXT_DIFF, texts: PAGE_CAPTIONS.changed };
export const SITEMAP_MONITOR_RESTING = { ...SITEMAP_AFTER, texts: SITEMAP_CAPTIONS.changed };
export const EXTRACT_MONITOR_RESTING = { ...RECORD_SCORED, texts: EXTRACT_CAPTION };
