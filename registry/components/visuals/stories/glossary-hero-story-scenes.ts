import { HERO_STORY_GRID, between, blankScreen, heroCaption, pictureOfStates } from '@/components/visuals/stories/hero-story-kit';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/visuals/dot-engine/dot-morph-dots';
import { paintShape, roundedBox, type DotBox } from '@/components/visuals/dot-engine/dot-story-cells';

/** The glossary hero's pictures, in the brand dot grid: an open book being read, and one of its entries up close. */

const PAGES: DotBox[] = [
	{ left: 3, right: 15, top: 6, bottom: 31 },
	{ left: 17, right: 29, top: 6, bottom: 31 },
];
const PAGE_LINE = { firstRow: 10, every: 3, perPage: 7, inset: 2 };
// How far short of the page's edge each line stops, so the two pages read as text rather than ruled paper.
const LINE_SHORTFALLS = [0, 2, 0, 4, 1, 0, 5];
export const BOOK_LINE_COUNT = PAGES.length * PAGE_LINE.perPage;

/** The book with the line being read (none when negative) solid, and the rest rings. Lines run down one page, then the next. */
export function paintBook(states: Uint8Array, reading: number) {
	PAGES.forEach((page, pageIndex) => {
		paintShape(HERO_STORY_GRID, states, roundedBox(page, 1), (column, row) => {
			const line = (row - PAGE_LINE.firstRow) / PAGE_LINE.every;
			if (!Number.isInteger(line) || !between(line, 0, PAGE_LINE.perPage - 1)) return DOT_ABSENT;
			if (!between(column, page.left + PAGE_LINE.inset, page.right - PAGE_LINE.inset - LINE_SHORTFALLS[line])) return DOT_ABSENT;
			return pageIndex * PAGE_LINE.perPage + line === reading ? DOT_FILLED : DOT_HOLLOW;
		});
	});
	return states;
}

export const BOOK_UNREAD = pictureOfStates(paintBook(blankScreen(), -1));

const ENTRY: DotBox = { left: 3, right: 29, top: 7, bottom: 30 };
const ENTRY_LEFT = 6;
const TERM_ROWS = [10, 11];
const DEFINITION = [
	{ row: 15, right: 26 },
	{ row: 18, right: 23 },
	{ row: 21, right: 25 },
	{ row: 24, right: 21 },
	{ row: 27, right: 16 },
];
/** The terms looked up, and how many dots wide each sets on the entry. */
export const TERMS = [
	{ word: 'crawling', dots: 12 },
	{ word: 'HTTP', dots: 7 },
	{ word: 'APIs', dots: 7 },
	{ word: 'brands', dots: 10 },
];

/** The entry for the term at `index`: the term set solid, its definition in rings beneath. */
export function paintEntry(states: Uint8Array, index: number) {
	return paintShape(HERO_STORY_GRID, states, roundedBox(ENTRY, 2), (column, row) => {
		if (TERM_ROWS.includes(row)) return between(column, ENTRY_LEFT, ENTRY_LEFT + TERMS[index].dots - 1) ? DOT_FILLED : DOT_ABSENT;
		const line = DEFINITION.find((candidate) => candidate.row === row);
		return line && between(column, ENTRY_LEFT, line.right) ? DOT_HOLLOW : DOT_ABSENT;
	});
}

export const ENTRIES = TERMS.map((_, index) => pictureOfStates(paintEntry(blankScreen(), index)));

export const BOOK_CAPTION = heroCaption('the glossary', 'A to Z', 'plain-English definitions');
export const ENTRY_CAPTIONS = TERMS.map(({ word }) => heroCaption('look up', word, 'and what it means'));

/** The open book: what the picture shows before it plays, and instead of playing with reduced motion. */
export const GLOSSARY_RESTING = { ...BOOK_UNREAD, texts: BOOK_CAPTION };
