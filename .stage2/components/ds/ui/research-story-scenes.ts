import { glyphCellsFromRows, type GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import type { DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { cellStates, cellsOfStates, outlineCells, placeCells, type Region } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Run deep research on demand" card's pictures, in the brand dot grid: a magnifying glass reads its way across a
 * company's page, then the page becomes the brand profile it was read into: typeface, colours, logo and facts.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const RESEARCH_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = RESEARCH_STORY_GRID;
const x = (column: number) => column * PITCH;
const y = (row: number) => row * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => y(row + 0.5) + size / 3;

export interface StoryPicture {
	states: Uint8Array;
	cells: GlyphCell[];
}

function picture(cells: GlyphCell[]): StoryPicture {
	const states = cellStates(RESEARCH_STORY_GRID, cells);
	return { states, cells: cellsOfStates(RESEARCH_STORY_GRID, states) };
}

const PAGE: Region = { left: 8, top: 1, columns: 42, rows: 36 };
const FIRST_LINE_ROW = PAGE.top + 6;
const LINE_PITCH = 2;
const LINE_LEFT = PAGE.left + 3;
const SHORTEST_LINE = 18;
const LINE_SPREAD = 19;
// Every fifth line is left out, so the lines read as paragraphs.
const PARAGRAPH_LINES = 5;

function lineLength(line: number) {
	const hash = Math.sin(line * 91.7) * 43758.5453;
	return SHORTEST_LINE + Math.floor((hash - Math.floor(hash)) * LINE_SPREAD);
}

function pageLines(): GlyphCell[] {
	const cells: GlyphCell[] = [];
	for (let line = 0, row = FIRST_LINE_ROW; row < PAGE.top + PAGE.rows - 2; line++, row += LINE_PITCH) {
		if (line % PARAGRAPH_LINES === PARAGRAPH_LINES - 1) continue;
		for (let step = 0; step < lineLength(line); step++) cells.push({ column: LINE_LEFT + step, row, filled: false });
	}
	return cells;
}

/** The company's page, its text as lines of rings: the open web, not yet read. */
export const PAGE_PICTURE = picture([...outlineCells(PAGE), ...pageLines()]);
export const DOMAIN: DotStoryText = { text: 'notion.com', x: x(LINE_LEFT), y: baselineOn(PAGE.top + 2.5, 22), size: 22, weight: 700 };

export const LENS = { radius: 6.5, rim: 1, handleLength: 7, handleWidth: 1.1 };
/** Where the glass wanders: once across the page and back while it goes twice down and up. */
export const LENS_PATH = { centre: { column: 27, row: 19 }, reach: { column: 10, row: 8 } };

const SQUARE_ROOT_OF_HALF = Math.SQRT1_2;

function distanceToHandle(column: number, row: number, centre: { column: number; row: number }) {
	const from = LENS.radius * SQUARE_ROOT_OF_HALF;
	const along = Math.min(LENS.handleLength, Math.max(0, (column - centre.column - from + (row - centre.row - from)) * SQUARE_ROOT_OF_HALF));
	const reach = from + along * SQUARE_ROOT_OF_HALF;
	return Math.hypot(column - centre.column - reach, row - centre.row - reach);
}

/**
 * Lays the glass over the page: a solid rim and handle, and under the lens the page's rings read into solid dots
 * while everything else clears, so the glass shows only what it has found.
 */
export function paintMagnifier(states: Uint8Array, page: Uint8Array, centre: { column: number; row: number }, solid: number, absent: number) {
	const reach = Math.ceil(LENS.radius + LENS.handleLength) + 1;
	for (let row = Math.max(0, Math.floor(centre.row - reach)); row <= Math.min(ROWS - 1, Math.ceil(centre.row + reach)); row++) {
		for (let column = Math.max(0, Math.floor(centre.column - reach)); column <= Math.min(COLUMNS - 1, Math.ceil(centre.column + reach)); column++) {
			const cell = row * COLUMNS + column;
			const fromCentre = Math.hypot(column - centre.column, row - centre.row);
			if (Math.abs(fromCentre - LENS.radius) <= LENS.rim || distanceToHandle(column, row, centre) <= LENS.handleWidth) states[cell] = solid;
			else if (fromCentre < LENS.radius) states[cell] = page[cell] === absent ? absent : solid;
		}
	}
}

const CARD = { columns: 28, rows: 18 };
const cardAt = (column: 0 | 1, row: 0 | 1): Region => ({ left: column * (CARD.columns + 2), top: row * (CARD.rows + 2), ...CARD });
const TYPEFACE = cardAt(0, 0);
const COLOURS = cardAt(1, 0);
const LOGO = cardAt(0, 1);
const FACTS = cardAt(1, 1);

const label = (text: string, card: Region): DotStoryText => ({ text, x: x(card.left + 2), y: baselineOn(card.top + 2, 13), size: 13, weight: 700, muted: true });

const SPECIMEN_BASELINE_ROW = 13;
const typefaceCells: GlyphCell[] = Array.from({ length: CARD.columns - 4 }, (_, step) => ({ column: TYPEFACE.left + 2 + step, row: TYPEFACE.top + SPECIMEN_BASELINE_ROW, filled: false }));

const SWATCH = { columns: 5, rows: 7, gap: 1, top: 7 };
const SHADES = 4;
// Four shades of one colour, as four densities of the brand's two circles: all solid down to all rings.
const isShadeFilled = (shade: number, column: number, row: number) => [true, column % 2 === 1 || row % 2 === 1, (column + row) % 2 === 0, false][shade];
const colourCells: GlyphCell[] = Array.from({ length: SHADES }, (_, shade) => {
	const left = COLOURS.left + 3 + shade * (SWATCH.columns + SWATCH.gap);
	return Array.from({ length: SWATCH.columns * SWATCH.rows }, (_, index) => {
		const column = index % SWATCH.columns;
		const row = Math.floor(index / SWATCH.columns);
		return { column: left + column, row: COLOURS.top + SWATCH.top + row, filled: isShadeFilled(shade, column, row) };
	});
}).flat();

// Notion's mark: a block with a rounded face and a heavy N set in it.
const NOTION_MARK_ROWS = [' ########### ', '#############', '##ooooooooo##', '##o##ooo##o##', '##o###oo##o##', '##o####o##o##', '##o##o####o##', '##o##oo###o##', '##o##ooo##o##', '##ooooooooo##', '#############', ' ########### '];
const MARK = { left: LOGO.left + 8, top: LOGO.top + 4 };
const logoCells = () => placeCells(glyphCellsFromRows(NOTION_MARK_ROWS), MARK);

const FACT_ROWS = [6, 10, 14];
const FACT_TEXTS = ['Software (B2B)', 'Founded 2013', 'San Francisco'];
const factCells: GlyphCell[] = FACT_ROWS.map((row) => ({ column: FACTS.left + 3, row: FACTS.top + row, filled: true }));

export interface ProfileCard {
	region: Region;
	contents: GlyphCell[];
	texts: DotStoryText[];
}

export const PROFILE_CARDS: ProfileCard[] = [
	{ region: TYPEFACE, contents: typefaceCells, texts: [label('Typeface', TYPEFACE), { text: 'Aa', x: x(TYPEFACE.left + 3), y: y(TYPEFACE.top + SPECIMEN_BASELINE_ROW) - 4, size: 84, weight: 800 }] },
	{ region: COLOURS, contents: colourCells, texts: [label('Colors', COLOURS)] },
	{ region: LOGO, contents: logoCells(), texts: [label('Logo', LOGO)] },
	{ region: FACTS, contents: factCells, texts: [label('Profile', FACTS), ...FACT_TEXTS.map((text, index) => ({ text, x: x(FACTS.left + 5), y: baselineOn(FACTS.top + FACT_ROWS[index], 15), size: 15, weight: 600 }))] },
];

/** The four cards with nothing in them yet: what the page melts into. */
export const CARD_FRAMES = picture(PROFILE_CARDS.flatMap((card) => outlineCells(card.region)));

/** The whole profile: what the picture shows before it plays, and instead of playing with reduced motion. */
export const RESEARCH_RESTING = {
	...picture([...CARD_FRAMES.cells, ...PROFILE_CARDS.flatMap((card) => card.contents)]),
	texts: PROFILE_CARDS.flatMap((card) => card.texts),
};
