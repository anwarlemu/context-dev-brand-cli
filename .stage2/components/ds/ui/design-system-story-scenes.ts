import { OUTPUT_STORY_GRID, PAGE_ALONE, PAGE_BODY_ROWS, PAGE_URL } from '@/components/ds/ui/output-story-scenes';
import { typeSpecimen } from '@/components/ds/ui/style-guide-parts';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, isInDotBox, rings, roundedBox, solid, solidWithSpeckle, type DotBox, type DotPainter } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The Style guide page's pictures, in the brand dot grid: a live website, and the design system read out of it, a
 * board with its type, its colors, its buttons and its spacing scale each in their own quarter.
 */

export const DESIGN_SYSTEM_STORY_GRID: DotGrid = OUTPUT_STORY_GRID;

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = DESIGN_SYSTEM_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const between = (value: number, from: number, to: number) => value >= from && value <= to;

// The website is the Scrape page's browser, moved down to the middle of the picture it has to itself here.
const SITE_DROP = 5;
const siteStates = new Uint8Array(COLUMNS * ROWS);
siteStates.set(PAGE_ALONE.states.subarray(0, (ROWS - SITE_DROP) * COLUMNS), SITE_DROP * COLUMNS);
export const WEBSITE: StoryPicture = { states: siteStates, cells: cellsOfStates(DESIGN_SYSTEM_STORY_GRID, siteStates) };
export const SITE_URL: DotStoryText = { ...PAGE_URL, y: PAGE_URL.y + SITE_DROP * PITCH };
const SITE_BODY = { top: PAGE_BODY_ROWS.top + SITE_DROP - 1, bottom: PAGE_BODY_ROWS.bottom + SITE_DROP, left: PAGE_BODY_ROWS.left - 2, right: PAGE_BODY_ROWS.right + 2 };

/** The website with a scan `scanned` of the way down it: a solid bar across the page (none at 0 or 1). */
export function paintScan(states: Uint8Array, scanned: number) {
	if (scanned <= 0 || scanned >= 1) return states;
	const bar = SITE_BODY.top + Math.round(scanned * (SITE_BODY.bottom - SITE_BODY.top));
	for (let column = SITE_BODY.left; column <= SITE_BODY.right; column++) states[bar * COLUMNS + column] = DOT_FILLED;
	return states;
}

const BOARD = { left: 3, right: 54, top: 2, bottom: 35, column: 29, row: 19 };
const SPECIMEN = typeSpecimen({ column: 7, row: 5 }, 9, 0.9);
const SWATCH = { top: 5, bottom: 12, columns: 6, lefts: [33, 40, 47], tones: [solid, solidWithSpeckle, rings], radius: 1 };
const BUTTONS: { box: DotBox; isPrimary: boolean }[] = [
	{ box: { left: 7, right: 24, top: 22, bottom: 25 }, isPrimary: true },
	{ box: { left: 7, right: 24, top: 27, bottom: 30 }, isPrimary: false },
];
const BUTTON_RADIUS = 1.5;
const SPACE = { left: 33, rows: [22, 24, 27, 30], lengths: [2, 4, 8, 16] };

// Each quarter of the board holds one part of the design system.
const board: DotPainter = (column, row) => {
	if (!isInDotBox(BOARD, column, row)) return DOT_ABSENT;
	if (column === BOARD.left || column === BOARD.right || row === BOARD.top || row === BOARD.bottom) return DOT_FILLED;
	if (column === BOARD.column || row === BOARD.row) return DOT_HOLLOW;
	if (SPECIMEN(column, row)) return DOT_FILLED;
	const swatch = SWATCH.lefts.findIndex((left) => roundedBox({ left, right: left + SWATCH.columns - 1, top: SWATCH.top, bottom: SWATCH.bottom }, SWATCH.radius)(column, row));
	if (swatch >= 0) {
		const isEdge = column === SWATCH.lefts[swatch] || column === SWATCH.lefts[swatch] + SWATCH.columns - 1 || row === SWATCH.top || row === SWATCH.bottom;
		return isEdge ? DOT_FILLED : SWATCH.tones[swatch](column, row);
	}
	const button = BUTTONS.find(({ box }) => roundedBox(box, BUTTON_RADIUS)(column, row));
	if (button) return button.isPrimary || column === button.box.left || column === button.box.right || row === button.box.top || row === button.box.bottom ? DOT_FILLED : DOT_ABSENT;
	const space = SPACE.rows.indexOf(row);
	return space >= 0 && between(column, SPACE.left, SPACE.left + SPACE.lengths[space] - 1) ? DOT_FILLED : DOT_ABSENT;
};

export const STYLE_BOARD = pictureOf(DESIGN_SYSTEM_STORY_GRID, board);

const label = (text: string, column: number, row: number): DotStoryText => ({ text, x: x(column), y: baselineOn(row, 13), size: 13, weight: 700, muted: true });
/** What each quarter of the board says, in the order they are read. */
export const BOARD_LABELS: DotStoryText[] = [label('Inter, 400 to 600', 7, 16), label('3 color roles', 33, 15.5), label('radius 8px', 7, 32.5), label('4, 8, 16, 32', 33, 32.5)];

/** The board: what the picture shows before it plays, and instead of playing with reduced motion. */
export const DESIGN_SYSTEM_RESTING = { ...STYLE_BOARD, texts: BOARD_LABELS };
