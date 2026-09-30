import { glyphCellsFromRows, type GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import type { DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { cellStates, cellsOfStates, fillCells, isFilledAmongRings, isFilledAmongSolids, outlineCells, type Region } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Ground RAG in fresh content" card's pictures, in the brand dot grid: a question is typed into a search field,
 * the field becomes a brain, and the brain hands out the pages that answer it.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const RAG_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = RAG_STORY_GRID;
const x = (column: number) => column * PITCH;
const y = (row: number) => row * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => y(row + 0.5) + size / 3;

export interface StoryPicture {
	states: Uint8Array;
	cells: GlyphCell[];
}

function picture(cells: GlyphCell[]): StoryPicture {
	const states = cellStates(RAG_STORY_GRID, cells);
	return { states, cells: cellsOfStates(RAG_STORY_GRID, states) };
}

const FIELD: Region = { left: 5, top: 14, columns: 48, rows: 10 };
const MAGNIFIER_ROWS = [' ### ', '#   #', '#   #', ' ### ', '    #', '     #'];
const MAGNIFIER = { left: FIELD.left + 3, top: FIELD.top + 2 };

// A solid border with a band of rings inside it, and the corners taken off so the field reads as rounded.
function searchField(): GlyphCell[] {
	const cells: GlyphCell[] = [];
	const right = FIELD.left + FIELD.columns - 1;
	const bottom = FIELD.top + FIELD.rows - 1;
	for (let row = FIELD.top; row <= bottom; row++) {
		for (let column = FIELD.left; column <= right; column++) {
			const depth = Math.min(column - FIELD.left, right - column, row - FIELD.top, bottom - row);
			const isCorner = (column === FIELD.left || column === right) && (row === FIELD.top || row === bottom);
			if (depth > 1 || isCorner) continue;
			cells.push({ column, row, filled: depth === 0 });
		}
	}
	return [...cells, ...glyphCellsFromRows(MAGNIFIER_ROWS).map((cell) => ({ ...cell, column: cell.column + MAGNIFIER.left, row: cell.row + MAGNIFIER.top }))];
}

export const SEARCH = picture(searchField());
export const SEARCH_INSIDE: Region = { left: FIELD.left + 2, top: FIELD.top + 2, columns: FIELD.columns - 4, rows: FIELD.rows - 4 };
// A field that is only a border has too little in it to melt into or out of, so it fills with rings before it
// becomes the brain and empties again once it is back.
export const SEARCH_FILLED = picture([...fillCells(SEARCH_INSIDE, false), ...searchField()]);
/** The field's band of rings, left to right: the scan that runs along it while the search is out. */
export const SEARCH_BAND = SEARCH.cells.filter((cell) => !cell.filled);
export const QUERY: DotStoryText = { text: 'what changed in v3?', x: x(FIELD.left + 10), y: baselineOn(FIELD.top + FIELD.rows / 2 - 0.5, 22), size: 22, weight: 700 };

const BRAIN_CENTRE = { column: 29, row: 18.5 };
// One hemisphere as overlapping lobes, measured out from the fissure; the other mirrors it.
const LOBES = [
	{ out: 4.5, down: -6.5, radius: 4.6, folds: false },
	{ out: 8.5, down: -3, radius: 4.4, folds: true },
	{ out: 8.5, down: 2.5, radius: 4.4, folds: false },
	{ out: 4.5, down: 6, radius: 4.6, folds: true },
	{ out: 3.5, down: 0, radius: 5, folds: false },
];
const FOLD_WIDTH = 0.5;
const FOLD_DEPTH = 1.2;

const lobeDistances = (column: number, row: number) => LOBES.map((lobe) => Math.hypot(Math.abs(column - BRAIN_CENTRE.column) - lobe.out, row - BRAIN_CENTRE.row - lobe.down));
const STEM: Region = { left: BRAIN_CENTRE.column - 1, top: 28, columns: 3, rows: 4 };
const isInStem = (column: number, row: number) => column >= STEM.left && column < STEM.left + STEM.columns && row >= STEM.top && row < STEM.top + STEM.rows;
const isInLobes = (column: number, row: number) => column !== BRAIN_CENTRE.column && lobeDistances(column, row).some((distance, lobe) => distance <= LOBES[lobe].radius);
const isInBrain = (column: number, row: number) => isInLobes(column, row) || isInStem(column, row);
const isOnBrainEdge = (column: number, row: number) => !isInBrain(column - 1, row) || !isInBrain(column + 1, row) || !isInBrain(column, row - 1) || !isInBrain(column, row + 1);

// A fold runs where a lobe's rim passes through another lobe: the dots along it drop out, the way the envelope's fold
// does. Only some lobes fold, or the rims crossing each other would leave little of the brain standing.
function isOnFold(column: number, row: number) {
	const distances = lobeDistances(column, row);
	return distances.some((distance, lobe) => LOBES[lobe].folds && Math.abs(distance - LOBES[lobe].radius) < FOLD_WIDTH && distances.some((other, otherLobe) => otherLobe !== lobe && other < LOBES[otherLobe].radius - FOLD_DEPTH));
}

// The brand's two circles, a hemisphere each: rings for the open web it reads, solid dots for the context it keeps.
function brain(): GlyphCell[] {
	const cells: GlyphCell[] = [];
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS; column++) {
			if (!isInBrain(column, row)) continue;
			if (isOnBrainEdge(column, row) || isInStem(column, row)) cells.push({ column, row, filled: column !== BRAIN_CENTRE.column || !isInStem(column, row) || isOnBrainEdge(column, row) });
			else if (!isOnFold(column, row)) cells.push({ column, row, filled: column < BRAIN_CENTRE.column ? isFilledAmongRings(column, row) : isFilledAmongSolids(column, row) });
		}
	}
	return cells;
}

export const BRAIN = picture(brain());

const CARD_SIZE = { columns: 13, rows: 9 };
const CARD_LINES = [
	{ row: 5, columns: 9 },
	{ row: 6, columns: 6 },
];
const CARD_TITLE_SIZE = 15;

export interface SourceCard {
	region: Region;
	cells: GlyphCell[];
	/** The rule between the brain and the card, in the order a page travels it. */
	link: GlyphCell[];
	title: DotStoryText;
}

function sourceCard(title: string, left: number, top: number): SourceCard {
	const region: Region = { left, top, ...CARD_SIZE };
	const lines = CARD_LINES.flatMap(({ row, columns }) => Array.from({ length: columns }, (_, index) => ({ column: left + 2 + index, row: top + row, filled: false })));
	const linkRow = top + Math.floor(CARD_SIZE.rows / 2);
	const isLeftOfBrain = left < BRAIN_CENTRE.column;
	const step = isLeftOfBrain ? -1 : 1;
	const cardEdge = isLeftOfBrain ? left + CARD_SIZE.columns : left - 1;
	const link: GlyphCell[] = [];
	for (let column = cardEdge; !isInBrain(column, linkRow) && column > 0 && column < COLUMNS; column -= step) link.unshift({ column, row: linkRow, filled: false });
	return { region, cells: [...outlineCells(region), ...lines], link, title: { text: title, x: x(left + 2), y: baselineOn(top + 2.5, CARD_TITLE_SIZE), size: CARD_TITLE_SIZE, weight: 700 } };
}

export const SOURCE_CARDS: SourceCard[] = [sourceCard('/changelog', 0, 7), sourceCard('/blog/v3', COLUMNS - CARD_SIZE.columns, 14), sourceCard('/docs/sdk', 0, 22)];

/** Everything retrieved: what the picture shows before it plays, and instead of playing with reduced motion. */
export const RAG_RESTING = {
	...picture([...BRAIN.cells, ...SOURCE_CARDS.flatMap((card) => [...card.link, ...card.cells])]),
	texts: SOURCE_CARDS.map((card) => card.title),
};
