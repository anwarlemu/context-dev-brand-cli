import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf } from '@/components/ds/ui/dot-story-beats';
import { polygon, rectangle, ringsWithSpeckle, solid, solidWithSpeckle, stack, type DotPainter } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The Search card's pictures, in the brand dot grid: a question is typed at an old terminal, and the terminal becomes
 * what the search brings back, three ranked results with their pages already read.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const SEARCH_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const PITCH = SEARCH_STORY_GRID.pitch;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;

const CASE = { left: 12, right: 45, top: 1, bottom: 24 };
const CASE_CORNER = 2;
const SCREEN = { left: 16, right: 41, top: 4, bottom: 19 };
const CONTROLS = { top: 21, bottom: 23, knobs: [38, 41], vents: { from: 15, to: 23 }, row: 22 };
const NECK = { left: 26, right: 31, top: 25, bottom: 26 };
const BASE = { left: 20, right: 37, top: 27, bottom: 29, flare: 2 };
const KEYBOARD = { left: 14, right: 43, top: 31, bottom: 37, flare: 4 };
const SPACE_BAR = { from: 22, to: 35, row: KEYBOARD.bottom - 1 };
const KEY_PITCH = 3;

const isWithin = ({ left, right, top, bottom }: { left: number; right: number; top: number; bottom: number }, column: number, row: number) => column >= left && column <= right && row >= top && row <= bottom;

// The tube's case, its corners taken off: a box that size with square corners read as a window, not a monitor.
const monitorCase = polygon(
	[
		{ column: CASE.left + CASE_CORNER, row: CASE.top },
		{ column: CASE.right - CASE_CORNER, row: CASE.top },
		{ column: CASE.right, row: CASE.top + CASE_CORNER },
		{ column: CASE.right, row: CASE.bottom - CASE_CORNER },
		{ column: CASE.right - CASE_CORNER, row: CASE.bottom },
		{ column: CASE.left + CASE_CORNER, row: CASE.bottom },
		{ column: CASE.left, row: CASE.bottom - CASE_CORNER },
		{ column: CASE.left, row: CASE.top + CASE_CORNER },
	],
	solidWithSpeckle
);

const monitor: DotPainter = (column, row) => {
	if (isWithin(SCREEN, column, row)) return column === SCREEN.left || column === SCREEN.right || row === SCREEN.top || row === SCREEN.bottom ? DOT_HOLLOW : DOT_ABSENT;
	const shell = monitorCase(column, row);
	if (shell === DOT_ABSENT || row < CONTROLS.top || row > CONTROLS.bottom || column <= CASE.left + 1 || column >= CASE.right - 1) return shell;
	if (row !== CONTROLS.row) return DOT_HOLLOW;
	const isVent = column >= CONTROLS.vents.from && column <= CONTROLS.vents.to && column % 2 === 1;
	return CONTROLS.knobs.includes(column) || isVent ? DOT_FILLED : DOT_HOLLOW;
};

const stand = stack(
	rectangle(NECK, solid),
	polygon(
		[
			{ column: BASE.left, row: BASE.top },
			{ column: BASE.right, row: BASE.top },
			{ column: BASE.right + BASE.flare, row: BASE.bottom },
			{ column: BASE.left - BASE.flare, row: BASE.bottom },
		],
		ringsWithSpeckle
	)
);

// Seen from the front and a little above, so it widens towards the typist; its keys are rings with gaps between them.
const keyboardDeck = polygon(
	[
		{ column: KEYBOARD.left, row: KEYBOARD.top },
		{ column: KEYBOARD.right, row: KEYBOARD.top },
		{ column: KEYBOARD.right + KEYBOARD.flare, row: KEYBOARD.bottom },
		{ column: KEYBOARD.left - KEYBOARD.flare, row: KEYBOARD.bottom },
	],
	(column, row) => {
		if (row === SPACE_BAR.row) return column >= SPACE_BAR.from && column <= SPACE_BAR.to ? DOT_FILLED : DOT_ABSENT;
		return (column + row) % KEY_PITCH === 0 ? DOT_ABSENT : DOT_HOLLOW;
	}
);

export const TERMINAL = pictureOf(SEARCH_STORY_GRID, stack(monitor, stand, keyboardDeck));
/** The keys, for the one that goes down with each letter typed. */
export const KEYS: GlyphCell[] = TERMINAL.cells.filter((cell) => !cell.filled && cell.row > KEYBOARD.top && cell.row < SPACE_BAR.row);

const SCREEN_LEFT = x(SCREEN.left + 2);
export const QUERY_LINES: DotStoryText[] = [
	{ text: '> How teams use', x: SCREEN_LEFT, y: baselineOn(SCREEN.top + 4, 19), size: 19, weight: 700 },
	{ text: '  Context.dev', x: SCREEN_LEFT, y: baselineOn(SCREEN.top + 8, 19), size: 19, weight: 700 },
];
export const SCREEN_LABEL: DotStoryText = { text: 'WEB SEARCH', x: SCREEN_LEFT, y: baselineOn(SCREEN.bottom - 2, 12), size: 12, weight: 700, muted: true };

const RESULT = { left: 3, right: 54, rows: 10, pitch: 12, top: 2, badge: 6 };
const RESULTS = [
	{ source: 'context.dev / customer stories', title: 'Dagny: brand context for agent onboarding' },
	{ source: 'context.dev / customer stories', title: 'Tinfoil: web scraping for a search agent' },
	{ source: 'context.dev / customer stories', title: 'Mintlify: branded docs from a repository' },
];
// The rank is cut out of its solid tab in rings: type set over the dots would only show between them.
const RANK_DIGITS = [
	[' o ', 'oo ', ' o ', ' o ', 'ooo'],
	['oo ', '  o', ' o ', 'o  ', 'ooo'],
	['oo ', '  o', ' o ', '  o', 'oo '],
];
const RANK_DIGIT = { left: 3, top: 3 };
const resultTop = (index: number) => RESULT.top + index * RESULT.pitch;
export const resultAt = (row: number) => Math.min(RESULTS.length - 1, Math.max(0, Math.floor((row - RESULT.top) / RESULT.pitch)));

// Each result is a bar with its rank on a solid tab. Full of rings it has enough in it to melt; cleared it has room
// for what the search read.
function resultBars(isCleared: boolean): DotPainter {
	return stack(
		...RESULTS.map((_, index): DotPainter => {
			const top = resultTop(index);
			const bar = rectangle({ left: RESULT.left, right: RESULT.right, top, bottom: top + RESULT.rows - 1 }, (column, row) => {
				if (column <= RESULT.left + RESULT.badge) return RANK_DIGITS[index][row - top - RANK_DIGIT.top]?.[column - RESULT.left - RANK_DIGIT.left] === 'o' ? DOT_HOLLOW : DOT_FILLED;
				if (!isCleared) return DOT_HOLLOW;
				return row === top + 2 && column === RESULT.right - 9 ? DOT_HOLLOW : DOT_ABSENT;
			});
			return bar;
		})
	);
}

export const RESULTS_FILLED = pictureOf(SEARCH_STORY_GRID, resultBars(false));
export const RESULTS_READ = pictureOf(SEARCH_STORY_GRID, resultBars(true));

export const RESULT_TEXTS: DotStoryText[][] = RESULTS.map(({ source, title }, index) => [
	{ text: source, x: x(RESULT.left + RESULT.badge + 3), y: baselineOn(resultTop(index) + 2.5, 13), size: 13, weight: 600, muted: true },
	{ text: 'Markdown', x: x(RESULT.right - 1), y: baselineOn(resultTop(index) + 2.5, 12), size: 12, weight: 700, muted: true, anchor: 'end' },
	{ text: title, x: x(RESULT.left + RESULT.badge + 3), y: baselineOn(resultTop(index) + 6, 15), size: 15, weight: 700 },
]);

/** The results, read: what the picture shows before it plays, and instead of playing with reduced motion. */
export const SEARCH_RESTING = { ...RESULTS_READ, texts: RESULT_TEXTS.flat() };
