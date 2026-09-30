import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, disc, paintedStates, polygon, rectangle, rings, solid, solidWithSpeckle, stack, type DotPainter } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Choose your output" card's pictures, in the brand dot grid: a live page with a switch for each format under
 * it, and the three files the one request brings back, a Markdown document, the HTML and a screenshot.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const OUTPUT_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, pitch: PITCH } = OUTPUT_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;

const FORMATS = [
	{ name: 'Markdown', file: 'pricing.md', left: 2 },
	{ name: 'HTML', file: 'pricing.html', left: 21 },
	{ name: 'Screenshot', file: 'pricing.png', left: 40 },
];

const BROWSER = { left: 9, right: 48, top: 2, bottom: 24 };
const TITLE_BAR_BOTTOM = BROWSER.top + 3;
const BROWSER_BUTTONS = { row: BROWSER.top + 2, columns: [BROWSER.left + 2, BROWSER.left + 4, BROWSER.left + 6] };
const ADDRESS = { from: BROWSER.left + 10, to: BROWSER.right - 2 };
const BODY = { left: BROWSER.left + 3, right: BROWSER.right - 3, top: TITLE_BAR_BOTTOM + 3 };

const between = (value: number, from: number, to: number) => value >= from && value <= to;

// A marketing page: nav, a heading and copy with two buttons beside a picture, and a row of cards.
const webpage: DotPainter = (column, row) => {
	if (!between(column, BODY.left, BODY.right)) return DOT_ABSENT;
	const across = column - BODY.left;
	const down = row - BODY.top;
	if (down === 0) return across <= 3 ? DOT_FILLED : [24, 25, 26, 28, 29, 30, 32, 33].includes(across) ? DOT_HOLLOW : DOT_ABSENT;
	if (between(down, 3, 11) && across >= 21) return solidWithSpeckle(column, row);
	if (between(down, 3, 4) && across <= 15) return DOT_FILLED;
	if ((down === 6 && across <= 17) || (down === 8 && across <= 13)) return DOT_HOLLOW;
	if (between(down, 10, 11)) return across <= 5 ? DOT_FILLED : between(across, 7, 12) ? DOT_HOLLOW : DOT_ABSENT;
	if (between(down, 13, 14)) return across % 12 <= 9 ? solidWithSpeckle(column, row) : DOT_ABSENT;
	return DOT_ABSENT;
};

const browser = rectangle(BROWSER, (column, row) => {
	if (row <= TITLE_BAR_BOTTOM) {
		if (row === BROWSER_BUTTONS.row && BROWSER_BUTTONS.columns.includes(column)) return DOT_HOLLOW;
		// The address field is left empty, and the page's URL is written in it.
		if (row > BROWSER.top && row < TITLE_BAR_BOTTOM && between(column, ADDRESS.from, ADDRESS.to)) return DOT_ABSENT;
		return DOT_FILLED;
	}
	return webpage(column, row);
});

export const PAGE_URL: DotStoryText = { text: 'atlas.example/pricing', x: x(ADDRESS.from + 1), y: baselineOn(BROWSER.top + 1.5, 13), size: 13, weight: 700, muted: true };

const SWITCH = { top: 31, columns: 8, rows: 4, knob: 2, travel: 4 };
const SWITCH_LABEL_SIZE = 14;

/** One format's switch, `on` of the way from off (a ring track, its knob solid) to on (a solid track, its knob a ring). */
function paintSwitch(states: Uint8Array, left: number, on: number) {
	const isOn = on >= 0.5;
	const knobFrom = 1 + Math.round(on * SWITCH.travel);
	for (let down = 0; down < SWITCH.rows; down++) {
		for (let across = 0; across < SWITCH.columns; across++) {
			const isCorner = (down === 0 || down === SWITCH.rows - 1) && (across === 0 || across === SWITCH.columns - 1);
			if (isCorner) continue;
			const isKnob = between(down, 1, SWITCH.knob) && between(across, knobFrom, knobFrom + SWITCH.knob - 1);
			states[(SWITCH.top + down) * COLUMNS + left + across] = isKnob === isOn ? DOT_HOLLOW : DOT_FILLED;
		}
	}
}

/** The switches under the page, each `on[index]` of the way on. */
export function paintSwitches(states: Uint8Array, on: number[]) {
	FORMATS.forEach(({ left }, index) => paintSwitch(states, left - 1, on[index]));
	return states;
}

const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(OUTPUT_STORY_GRID, states) });
export const PAGE_AT_REST = pictureOfStates(paintSwitches(paintedStates(OUTPUT_STORY_GRID, browser), [0, 0, 0]));
/** The live page on its own, for stories that start from a website. */
export const PAGE_ALONE = pictureOf(OUTPUT_STORY_GRID, browser);
export const PAGE_BODY_ROWS = { top: BODY.top, bottom: BROWSER.bottom - 1, left: BODY.left, right: BODY.right };
export const PAGE_REQUESTED = pictureOfStates(paintSwitches(paintedStates(OUTPUT_STORY_GRID, browser), [1, 1, 1]));

export const REQUEST_LABEL: DotStoryText = { text: 'formats', x: x(FORMATS[0].left - 1), y: baselineOn(28, 12), size: 12, weight: 700, muted: true };
export const SWITCH_LABELS: DotStoryText[] = FORMATS.map(({ name, left }) => ({ text: name, x: x(left + SWITCH.columns + 0.5), y: baselineOn(SWITCH.top + 1.5, SWITCH_LABEL_SIZE), size: SWITCH_LABEL_SIZE, weight: 700 }));

const SHEET = { top: 2, bottom: 27, columns: 16, fold: 3 };

// What each file holds, drawn one string per row inside its sheet: `#` a solid dot, `o` a ring.
const MARKDOWN_ROWS = ['', '', '', '  # #', ' #####', '  # #', ' #####', '  # #', '', '', ' ##########', '', ' oooooooooooo', ' oooooooo', '', ' ## ooooo', '', ' # ooooooooo', ' # oooooo', ' # oooooooo', '', ' oooooooooo'];
const HTML_ROWS = ['', '', '', '   #   # #', '  #    #  #', ' #    #    #', '  #  #    #', '   # #   #', '', '', ' #oooooooo', '   #ooooooo', '   #oooooooo', '     #ooooo', '     #ooo', '   #ooo', '   #ooooooooo', '     #oooooo', '   #ooo', ' #oooo', '', ' #ooooooo'];

const drawnRows =
	(art: string[]): DotPainter =>
	(across, down) => {
		const mark = art[down]?.[across];
		return mark === '#' ? DOT_FILLED : mark === 'o' ? DOT_HOLLOW : DOT_ABSENT;
	};

// The captured page as a photograph: a sun over two peaks, the sky in rings.
const PHOTO = { left: 1, right: 12, top: 3, bottom: 21, sun: { column: 9.5, row: 7.5, radius: 2 }, peaks: [{ column: 4, row: 11 }, { column: 10, row: 15 }] };
const photo: DotPainter = (across, down) => {
	if (!between(across, PHOTO.left, PHOTO.right) || !between(down, PHOTO.top, PHOTO.bottom)) return DOT_ABSENT;
	if (disc(PHOTO.sun, PHOTO.sun.radius, solid)(across, down) !== DOT_ABSENT) return DOT_FILLED;
	return PHOTO.peaks.some((peak) => down >= peak.row + Math.abs(across - peak.column)) ? DOT_FILLED : DOT_HOLLOW;
};

const CONTENTS: DotPainter[] = [drawnRows(MARKDOWN_ROWS), drawnRows(HTML_ROWS), photo];

// A sheet of paper with its top corner folded over.
function sheet(left: number, interior: DotPainter): DotPainter {
	const right = left + SHEET.columns - 1;
	const fold = { column: right - SHEET.fold, row: SHEET.top + SHEET.fold };
	const paper = polygon(
		[
			{ column: left, row: SHEET.top },
			{ column: fold.column, row: SHEET.top },
			{ column: right, row: fold.row },
			{ column: right, row: SHEET.bottom },
			{ column: left, row: SHEET.bottom },
		],
		(column, row) => interior(column - left - 1, row - SHEET.top - 1)
	);
	const crease: DotPainter = (column, row) => ((column === fold.column && between(row, SHEET.top, fold.row)) || (row === fold.row && between(column, fold.column, right)) ? DOT_FILLED : DOT_ABSENT);
	return stack(crease, paper);
}

const sheets = (interiors: DotPainter[]) => stack(...FORMATS.map(({ left }, index) => sheet(left, interiors[index])));

// A sheet that is only an outline has too little in it to melt into, so the files arrive full of rings and are then
// written one after another.
export const BLANK_FILES = pictureOf(OUTPUT_STORY_GRID, sheets([rings, rings, rings]));
export const FILES = pictureOf(OUTPUT_STORY_GRID, sheets(CONTENTS));

/** How far through the writing a dot is reached: the files in order, each from its top down. */
export const writingOrder = (column: number, row: number) => {
	const file = FORMATS.findLastIndex(({ left }) => column >= left);
	return (Math.max(0, file) + (row - SHEET.top) / (SHEET.bottom - SHEET.top)) / FORMATS.length;
};

export const FILE_TEXTS: DotStoryText[][] = FORMATS.map(({ name, file, left }) => [
	{ text: name, x: x(left), y: baselineOn(SHEET.bottom + 3, 15), size: 15, weight: 800 },
	{ text: file, x: x(left), y: baselineOn(SHEET.bottom + 5.5, 12), size: 12, weight: 700, muted: true },
]);

/** The three files: what the picture shows before it plays, and instead of playing with reduced motion. */
export const OUTPUT_RESTING = { ...FILES, texts: FILE_TEXTS.flat() };
