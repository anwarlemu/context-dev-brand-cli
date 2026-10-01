import { promptField } from '@/components/ds/ui/prompt-field';
import { typeSpecimen } from '@/components/ds/ui/style-guide-parts';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, isInDotBox, paintShape, roundedBox, solidWithSpeckle, type DotBox, type DotPainter } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The Brand kit page's pictures, in the brand dot grid: a domain typed into a field, the kit it comes back as, a
 * box tied with a band, and the box unpacked into what is in it, a logo, colors, a typeface and the company's details.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const BRAND_KIT_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = BRAND_KIT_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(BRAND_KIT_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const FIELD_BOX: DotBox = { left: 9, right: 48, top: 13, bottom: 23 };
export const DOMAIN_FIELD = promptField(BRAND_KIT_GRID, FIELD_BOX);
export const DOMAIN: DotStoryText = { text: 'super.com', x: x(FIELD_BOX.left + 4), y: baselineOn((FIELD_BOX.top + FIELD_BOX.bottom) / 2, 24), size: 24, weight: 800 };

const BOX = { left: 16, right: 41, top: 12, bottom: 32, lid: { left: 14, right: 43, top: 6, bottom: 11 }, band: { left: 27, right: 30 } };
// A made-up mark, so no real company's logo is redrawn: a square with a disc over its corner.
const isMark = (across: number, down: number, size: number) => isInDotBox({ left: size * 0.35, right: size, top: 0, bottom: size * 0.65 }, across, down) || Math.hypot(across - size * 0.35, down - size * 0.65) <= size * 0.36;

const kitStates = blank();
// The box and its lid are solid card, tied with a band of rings; the lid's seal carries the mark.
paintShape(BRAND_KIT_GRID, kitStates, (column, row) => isInDotBox(BOX, column, row), (column, row) => (between(column, BOX.band.left, BOX.band.right) ? DOT_HOLLOW : solidWithSpeckle(column, row)));
paintShape(BRAND_KIT_GRID, kitStates, roundedBox(BOX.lid, 1), (column) => (between(column, BOX.band.left, BOX.band.right) ? DOT_HOLLOW : DOT_FILLED));
paintShape(BRAND_KIT_GRID, kitStates, roundedBox({ left: 23, right: 34, top: 17, bottom: 27 }, 2), (column, row) => (isMark(column - 25, row - 19, 7) ? DOT_FILLED : DOT_ABSENT));
export const KIT_BOX = pictureOfStates(kitStates);
export const KIT_LABEL: DotStoryText = { text: 'one API call, one brand kit', x: x(COLUMNS / 2), y: baselineOn(35, 14), size: 14, weight: 700, muted: true, anchor: 'middle' };

const TILE = { top: 6, bottom: 22, columns: 12, lefts: [2, 16, 30, 44] };
const tileBox = (index: number): DotBox => ({ left: TILE.lefts[index], right: TILE.lefts[index] + TILE.columns - 1, top: TILE.top, bottom: TILE.bottom });
const SPECIMEN = typeSpecimen({ column: TILE.lefts[2] + 2, row: TILE.top + 5 }, 5.6, 0.7);

// What is in the kit, one tile each: the logo, four colors from dark to light, the typeface and the company's details.
const CONTENTS: DotPainter[] = [
	(column, row) => (isMark(column - TILE.lefts[0] - 2.5, row - TILE.top - 5, 7) ? DOT_FILLED : DOT_ABSENT),
	(column, row) => {
		const stripe = Math.floor((row - TILE.top - 2) / 3.5);
		if (!between(column, TILE.lefts[1] + 2, TILE.lefts[1] + 9) || !between(stripe, 0, 3) || (row - TILE.top - 2) % 3.5 >= 2.5) return DOT_ABSENT;
		return stripe === 0 ? DOT_FILLED : stripe === 1 ? solidWithSpeckle(column, row) : stripe === 2 ? (solidWithSpeckle(column, row) === DOT_FILLED ? DOT_HOLLOW : DOT_FILLED) : DOT_HOLLOW;
	},
	(column, row) => (SPECIMEN(column, row) ? DOT_FILLED : row === TILE.bottom - 3 && between(column, TILE.lefts[2] + 2, TILE.lefts[2] + 9) ? DOT_HOLLOW : DOT_ABSENT),
	(column, row) => {
		const across = column - TILE.lefts[3];
		const down = row - TILE.top;
		if (between(down, 3, 4)) return between(across, 2, 7) ? DOT_FILLED : DOT_ABSENT;
		return [7, 9, 11, 13].includes(down) && between(across, 2, down === 11 ? 6 : 9) ? DOT_HOLLOW : DOT_ABSENT;
	},
];

const contentsOf = (isPacked: boolean) => {
	const states = blank();
	CONTENTS.forEach((content, index) => paintShape(BRAND_KIT_GRID, states, roundedBox(tileBox(index), 2), isPacked ? () => DOT_HOLLOW : content));
	return pictureOfStates(states);
};
// A tile that is only an outline has too little in it to melt into, so the tiles arrive full of rings and are then unpacked.
export const KIT_PACKED = contentsOf(true);
export const KIT_UNPACKED = contentsOf(false);
/** How far through the unpacking a dot is reached: the tiles in order, left to right. */
export const unpackingOrder = (column: number) => Math.min(1, Math.max(0, column / COLUMNS));

const NAMES = ['Logo', 'Colors', 'Fonts', 'Company'];
const DETAILS = ['SVG, PNG', '4 roles', 'Inter', 'Software'];
export const KIT_TEXTS: DotStoryText[][] = NAMES.map((name, index) => [
	{ text: name, x: x(TILE.lefts[index]), y: baselineOn(TILE.bottom + 3, 15), size: 15, weight: 800 },
	{ text: DETAILS[index], x: x(TILE.lefts[index]), y: baselineOn(TILE.bottom + 5.5, 12), size: 12, weight: 700, muted: true },
]);

/** The unpacked kit: what the picture shows before it plays, and instead of playing with reduced motion. */
export const BRAND_KIT_RESTING = { ...KIT_UNPACKED, texts: KIT_TEXTS.flat() };
