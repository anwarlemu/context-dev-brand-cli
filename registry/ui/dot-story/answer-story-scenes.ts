import { glyphCellsFromRows } from '@/components/ds/ui/dot-glyph-cells';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellStates, cellsOfStates, placeCells, polygon, rectangle, ringsWithSpeckle, solidWithSpeckle, stack, type DotPainter } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The Research card's pictures, in the brand dot grid: the question as it is asked, the sources that are read to
 * answer it, and the answer in the shape that was asked for, a JSON object between its braces.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const ANSWER_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, pitch: PITCH } = ANSWER_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;

const BUBBLE = { left: 5, right: 52, top: 3, bottom: 25, corner: 2, band: 1 };
const TAIL = { from: 12, to: 21, tip: { column: 10, row: 32 } };
export const THINKING = { row: BUBBLE.bottom - 4, columns: [40, 43, 46] };

// A heavy outline with a band of rings inside it, so the bubble has something in it to melt.
const bubble = polygon(
	[
		{ column: BUBBLE.left + BUBBLE.corner, row: BUBBLE.top },
		{ column: BUBBLE.right - BUBBLE.corner, row: BUBBLE.top },
		{ column: BUBBLE.right, row: BUBBLE.top + BUBBLE.corner },
		{ column: BUBBLE.right, row: BUBBLE.bottom - BUBBLE.corner },
		{ column: BUBBLE.right - BUBBLE.corner, row: BUBBLE.bottom },
		{ column: TAIL.to, row: BUBBLE.bottom },
		TAIL.tip,
		{ column: TAIL.from, row: BUBBLE.bottom },
		{ column: BUBBLE.left + BUBBLE.corner, row: BUBBLE.bottom },
		{ column: BUBBLE.left, row: BUBBLE.bottom - BUBBLE.corner },
		{ column: BUBBLE.left, row: BUBBLE.top + BUBBLE.corner },
	],
	(column, row) => {
		if (row > BUBBLE.bottom) return DOT_HOLLOW;
		const depth = Math.min(column - BUBBLE.left, BUBBLE.right - column, row - BUBBLE.top, BUBBLE.bottom - row);
		if (depth <= BUBBLE.band + 1) return DOT_HOLLOW;
		return row === THINKING.row && THINKING.columns.includes(column) ? DOT_HOLLOW : DOT_ABSENT;
	}
);

export const QUESTION = pictureOf(ANSWER_STORY_GRID, bubble);
export const QUESTION_LINES: DotStoryText[] = [
	{ text: 'How does Mintlify use', x: x(BUBBLE.left + 5), y: baselineOn(BUBBLE.top + 6, 22), size: 22, weight: 700 },
	{ text: 'Context.dev?', x: x(BUBBLE.left + 5), y: baselineOn(BUBBLE.top + 11, 22), size: 22, weight: 700 },
];

const BOOK = { columns: 40, rows: 8, spine: 4, pages: 3 };
export const BOOKS = [
	{ left: 10, top: 5, isDark: true },
	{ left: 7, top: 15, isDark: false },
	{ left: 11, top: 25, isDark: true },
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

export const SOURCES = pictureOf(ANSWER_STORY_GRID, stack(...BOOKS.map(book)));
export const BOOK_SIZE = BOOK;
export const SOURCES_LABEL: DotStoryText = { text: 'Reading 3 sources', x: x(COLUMNS / 2), y: baselineOn(35, 14), size: 14, weight: 700, muted: true, anchor: 'middle' };

const BRACE_ROWS = ['   ###', '  ####', ' ###  ', ...Array<string>(9).fill(' ##   '), '###   ', '##    ', '###   ', ...Array<string>(9).fill(' ##   '), ' ###  ', '  ####', '   ###'];
const BRACE = { top: 5, left: 3, columns: 6 };
const openingBrace = placeCells(glyphCellsFromRows(BRACE_ROWS), BRACE);
const closingBrace = openingBrace.map((cell) => ({ ...cell, column: COLUMNS - 1 - cell.column }));

const FIELD_ROWS = [9, 14, 19, 24];
const FIELDS = ['"company": "Mintlify",', '"uses": "brand context",', '"for": "branded docs sites",', '"sources": 3'];
const CITED_ROW = 29;
const citations = [0, 2, 4].map((step) => ({ column: BRACE.left + BRACE.columns + 5 + step, row: CITED_ROW, filled: true }));
const bullets = FIELD_ROWS.map((row) => ({ column: BRACE.left + BRACE.columns + 3, row, filled: false }));

const pictureOfCells = (cells: typeof openingBrace): StoryPicture => {
	const states = cellStates(ANSWER_STORY_GRID, cells);
	return { states, cells: cellsOfStates(ANSWER_STORY_GRID, states) };
};

export const BRACES = pictureOfCells([...openingBrace, ...closingBrace]);
export const ANSWER = pictureOfCells([...openingBrace, ...closingBrace, ...bullets, ...citations]);
export const FIELD_TEXTS: DotStoryText[] = FIELDS.map((text, index) => ({ text, x: x(BRACE.left + BRACE.columns + 5), y: baselineOn(FIELD_ROWS[index], 16), size: 16, weight: 700 }));
export const CITED: DotStoryText = { text: '3 sources cited', x: x(BRACE.left + BRACE.columns + 12), y: baselineOn(CITED_ROW, 13), size: 13, weight: 700, muted: true };
export const FIELD_COUNT = FIELDS.length;
export const fieldAt = (row: number) =>
	Math.max(
		0,
		FIELD_ROWS.findIndex((fieldRow, index) => row <= fieldRow || index === FIELD_ROWS.length - 1)
	);

/** The answer in its shape: what the picture shows before it plays, and instead of playing with reduced motion. */
export const ANSWER_RESTING = { ...ANSWER, texts: [...FIELD_TEXTS, CITED] };
