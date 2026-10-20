import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import { pictureOf } from '@/components/visuals/dot-engine/dot-story-beats';
import { clear, isInDotBox, rectangle, solid, stack, type DotBox, type DotPainter } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryText } from '@/components/visuals/dot-engine/dot-story-player';

export const SEARCH_FILTERS_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { pitch: PITCH } = SEARCH_FILTERS_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;

const CALENDAR: DotBox = { left: 3, right: 25, top: 6, bottom: 30 };
const HEADER_ROWS = 3;
const POSTS: DotBox[] = [
	{ left: 8, right: 9, top: 4, bottom: 5 },
	{ left: 19, right: 20, top: 4, bottom: 5 },
];
export const DAY_COLUMNS = [5, 8, 11, 14, 17, 20, 23];
const DAY_ROWS = [12, 15, 18, 21, 24, 27];
export const LAST_WEEK_ROW = DAY_ROWS[DAY_ROWS.length - 1];

const BULLET_COLUMNS = { left: 30, right: 31 };
export const FILTER_GROUPS = [
	{ labelRow: 6, top: 9, bottom: 14 },
	{ labelRow: 19, top: 21, bottom: 24 },
	{ labelRow: 28, top: 31, bottom: 32 },
];
const INCLUDED_ROWS = [9, 13];
const COUNTRY_ROW = 31;
const EXCLUDE_MARK = { left: 29, top: 21, size: 4 };

function calendar(isLastWeekPicked: boolean): DotPainter {
	const header = rectangle({ ...CALENDAR, bottom: CALENDAR.top + HEADER_ROWS - 1 }, solid);
	const posts: DotPainter = (column, row) => (POSTS.some((post) => isInDotBox(post, column, row)) ? DOT_FILLED : DOT_ABSENT);
	const days: DotPainter = (column, row) => {
		if (!DAY_COLUMNS.includes(column) || !DAY_ROWS.includes(row)) return DOT_ABSENT;
		return isLastWeekPicked && row === LAST_WEEK_ROW ? DOT_FILLED : DOT_HOLLOW;
	};
	return stack(header, posts, days, rectangle(CALENDAR, clear));
}

const isBullet = (column: number, row: number, top: number) => column >= BULLET_COLUMNS.left && column <= BULLET_COLUMNS.right && (row === top || row === top + 1);

const domainFilters: DotPainter = (column, row) => {
	if (INCLUDED_ROWS.some((top) => isBullet(column, row, top)) || isBullet(column, row, COUNTRY_ROW)) return DOT_FILLED;
	const across = column - EXCLUDE_MARK.left;
	const down = row - EXCLUDE_MARK.top;
	const isOnMark = across >= 0 && across < EXCLUDE_MARK.size && down >= 0 && down < EXCLUDE_MARK.size && (across === down || across === EXCLUDE_MARK.size - 1 - down);
	return isOnMark ? DOT_FILLED : DOT_ABSENT;
};

export const CALENDAR_ONLY = pictureOf(SEARCH_FILTERS_STORY_GRID, calendar(false));
export const LAST_WEEK_PICKED = pictureOf(SEARCH_FILTERS_STORY_GRID, calendar(true));
export const FILTERED = pictureOf(SEARCH_FILTERS_STORY_GRID, stack(calendar(true), domainFilters));

export const FRESHNESS_LABEL: DotStoryText = { text: 'freshness', x: x(CALENDAR.left), y: baselineOn(2, 12), size: 12, weight: 700, muted: true };
export const FRESHNESS_VALUE: DotStoryText = { text: 'last_week', x: x(CALENDAR.left), y: baselineOn(34, 14), size: 14, weight: 700 };
export const FILTER_TEXTS: DotStoryText[][] = [
	[
		{ text: 'include', x: x(BULLET_COLUMNS.left), y: baselineOn(FILTER_GROUPS[0].labelRow, 12), size: 12, weight: 700, muted: true },
		{ text: 'arxiv.org', x: x(33), y: baselineOn(INCLUDED_ROWS[0] + 0.5, 14), size: 14, weight: 700 },
		{ text: 'github.com', x: x(33), y: baselineOn(INCLUDED_ROWS[1] + 0.5, 14), size: 14, weight: 700 },
	],
	[
		{ text: 'exclude', x: x(BULLET_COLUMNS.left), y: baselineOn(FILTER_GROUPS[1].labelRow, 12), size: 12, weight: 700, muted: true },
		{ text: 'pinterest.com', x: x(34), y: baselineOn(EXCLUDE_MARK.top + 1.5, 14), size: 14, weight: 700, muted: true },
	],
	[
		{ text: 'country', x: x(BULLET_COLUMNS.left), y: baselineOn(FILTER_GROUPS[2].labelRow, 12), size: 12, weight: 700, muted: true },
		{ text: 'US', x: x(33), y: baselineOn(COUNTRY_ROW + 0.5, 14), size: 14, weight: 700 },
	],
];

export const SEARCH_FILTERS_RESTING = { ...FILTERED, texts: [FRESHNESS_LABEL, FRESHNESS_VALUE, ...FILTER_TEXTS.flat()] };
