import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import { pictureOf } from '@/components/visuals/dot-engine/dot-story-beats';
import { clear, rectangle, stack, type DotBox, type DotPainter } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryText } from '@/components/visuals/dot-engine/dot-story-player';

export const FANOUT_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { pitch: PITCH } = FANOUT_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;

const QUESTION_FIELD: DotBox = { left: 3, right: 54, top: 4, bottom: 9 };
export const STEM = { column: 28, top: 10, bottom: 14 };
export const BRANCH_ROW = 15;
export const DROP = { top: 16, bottom: 18 };
export const SEARCHES = [
	{ left: 2, right: 18, query: 'agent citations' },
	{ left: 20, right: 36, query: 'llm grounding' },
	{ left: 39, right: 55, query: 'source links' },
];
export const SEARCH_FIELD = { top: 19, bottom: 23 };
export const RESULT_ROWS = [26, 28, 30];
const RANK_TAB = 4;
const RESULT_ENDS = [1, 4, 2];

const centerOf = ({ left, right }: { left: number; right: number }) => Math.round((left + right) / 2);
const BRANCH = { left: centerOf(SEARCHES[0]), right: centerOf(SEARCHES[SEARCHES.length - 1]) };

const questionField = rectangle(QUESTION_FIELD, clear);

const fanout: DotPainter = (column, row) => {
	if (column === STEM.column && row >= STEM.top && row <= STEM.bottom) return DOT_HOLLOW;
	if (row === BRANCH_ROW && column === STEM.column) return DOT_FILLED;
	if (row === BRANCH_ROW && column >= BRANCH.left && column <= BRANCH.right) return DOT_HOLLOW;
	if (row >= DROP.top && row <= DROP.bottom && SEARCHES.some((search) => centerOf(search) === column)) return DOT_HOLLOW;
	return DOT_ABSENT;
};

const searchFields = stack(...SEARCHES.map(({ left, right }) => rectangle({ left, right, top: SEARCH_FIELD.top, bottom: SEARCH_FIELD.bottom }, clear)));

const searchResults: DotPainter = (column, row) => {
	const line = RESULT_ROWS.indexOf(row);
	const search = SEARCHES.find(({ left, right }) => column > left && column < right);
	if (line < 0 || !search || column > search.right - RESULT_ENDS[line]) return DOT_ABSENT;
	return column <= search.left + RANK_TAB ? DOT_FILLED : DOT_HOLLOW;
};

export const QUESTION_ONLY = pictureOf(FANOUT_STORY_GRID, questionField);
export const FANNED_OUT = pictureOf(FANOUT_STORY_GRID, stack(questionField, fanout, searchFields, searchResults));

export const QUESTION_LABEL: DotStoryText = { text: 'query', x: x(QUESTION_FIELD.left + 1), y: baselineOn(2, 12), size: 12, weight: 700, muted: true };
export const QUESTION: DotStoryText = { text: 'how do agents cite web sources?', x: x(QUESTION_FIELD.left + 3), y: baselineOn(6.5, 15), size: 15, weight: 700 };
export const SEARCH_QUERIES: DotStoryText[] = SEARCHES.map(({ left, query }) => ({ text: query, x: x(left + 2), y: baselineOn(21, 12), size: 12, weight: 700 }));
export const FANOUT_LABEL: DotStoryText = { text: 'queryFanout: true', x: x(3), y: baselineOn(34.5, 12), size: 12, weight: 700, muted: true };
export const PARALLEL_LABEL: DotStoryText = { text: '3 searches in parallel', x: x(55), y: baselineOn(34.5, 12), size: 12, weight: 700, muted: true, anchor: 'end' };

export const FANOUT_RESTING = { ...FANNED_OUT, texts: [QUESTION_LABEL, QUESTION, ...SEARCH_QUERIES, FANOUT_LABEL, PARALLEL_LABEL] };
