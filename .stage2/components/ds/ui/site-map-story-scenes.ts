import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, distanceToSegment, paintedStates, polygon, ringsWithSpeckle, type DotPainter, type GridPoint } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The Map page's pictures, in the brand dot grid: a folded paper map with a pin in it, and what mapping a domain
 * returns, the site as a tree of its sections and their pages, with the pages chosen for scraping picked out.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const SITE_MAP_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, pitch: PITCH } = SITE_MAP_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const SHEET = { left: 8, right: 50, folds: [22, 36], top: 2, bottom: 26, rise: 4 };
const PIN = { centre: { column: 29, row: 13 }, radius: 4.3, hole: 1.5, tip: { column: 29, row: 22 }, moat: 1.6 };
const ROUTE: GridPoint[] = [{ column: 11, row: 26 }, { column: 17, row: 20 }, { column: 23, row: 26 }, { column: 29, row: 25 }];
const ROUTE_WIDTH = { line: 0.6, clearing: 1.5 };
const BLOCKS = [
	{ left: 40, right: 46, top: 8, bottom: 12 },
	{ left: 11, right: 16, top: 9, bottom: 13 },
	{ left: 39, right: 44, top: 19, bottom: 23 },
];

// How far a dot is inside the pin: its round head, or the taper from the head down to the tip. Negative is outside.
const insidePin = (column: number, row: number) => {
	const fromHead = Math.hypot(column - PIN.centre.column, row - PIN.centre.row);
	const down = (row - PIN.centre.row) / (PIN.tip.row - PIN.centre.row);
	const taper = between(down, 0, 1) ? PIN.radius * (1 - down) - Math.abs(column - PIN.centre.column) : -Infinity;
	return Math.max(PIN.radius - fromHead, taper);
};

// A map folded in three, its panels tilting alternately; on it a few city blocks, a route, and the pin it leads to.
const foldedMap = polygon(
	[
		{ column: SHEET.left, row: SHEET.top + SHEET.rise },
		{ column: SHEET.folds[0], row: SHEET.top },
		{ column: SHEET.folds[1], row: SHEET.top + SHEET.rise },
		{ column: SHEET.right, row: SHEET.top },
		{ column: SHEET.right, row: SHEET.bottom },
		{ column: SHEET.folds[1], row: SHEET.bottom + SHEET.rise },
		{ column: SHEET.folds[0], row: SHEET.bottom },
		{ column: SHEET.left, row: SHEET.bottom + SHEET.rise },
	],
	(column, row) => {
		const pin = insidePin(column, row);
		if (pin >= 0) return Math.hypot(column - PIN.centre.column, row - PIN.centre.row) <= PIN.hole ? DOT_HOLLOW : DOT_FILLED;
		if (pin > -PIN.moat) return DOT_ABSENT;
		if (SHEET.folds.includes(column)) return DOT_FILLED;
		const fromRoute = Math.min(...ROUTE.slice(1).map((point, index) => distanceToSegment(column, row, ROUTE[index], point)));
		if (fromRoute < ROUTE_WIDTH.line) return DOT_FILLED;
		if (fromRoute < ROUTE_WIDTH.clearing) return DOT_ABSENT;
		if (BLOCKS.some((block) => between(column, block.left, block.right) && between(row, block.top, block.bottom))) return ringsWithSpeckle(column, row) === DOT_FILLED ? DOT_HOLLOW : DOT_FILLED;
		return DOT_HOLLOW;
	}
);

export const PAPER_MAP = pictureOf(SITE_MAP_STORY_GRID, foldedMap);

const DOMAIN_SIZE = 20;
const DOMAIN_NAME = 'stripe.com';
// Doto is monospaced, each letter three fifths of its size wide; typed text is set from its left so the cursor can follow it.
export const DOMAIN: DotStoryText = { text: DOMAIN_NAME, x: x(COLUMNS / 2) - (DOMAIN_NAME.length * 0.6 * DOMAIN_SIZE) / 2, y: baselineOn(34, DOMAIN_SIZE), size: DOMAIN_SIZE, weight: 800 };

const ROOT = { left: 18, right: 38, top: 1, bottom: 6, centre: 28 };
const BRANCH_ROW = 10;
const SECTION = { columns: 17, top: 13, bottom: 18 };
const SECTIONS = [
	{ left: 0, path: '/pricing' },
	{ left: 20, path: '/docs' },
	{ left: 40, path: '/blog' },
];
const TILE = { columns: 5, rows: 5, every: 6, tops: [22, 29], perRow: 3 };
const centreOf = (left: number) => left + (SECTION.columns - 1) / 2;

interface Tile {
	left: number;
	top: number;
}
const TILES: Tile[] = SECTIONS.flatMap(({ left }) => TILE.tops.flatMap((top) => Array.from({ length: TILE.perRow }, (_, index) => ({ left: left + index * TILE.every, top }))));
/** The pages picked for scraping, in the order they are picked. */
const CHOSEN_TILES = [1, 3, 8, 10, 12, 16];
const tileAt = (column: number, row: number) => TILES.findIndex(({ left, top }) => between(column, left, left + TILE.columns - 1) && between(row, top, top + TILE.rows - 1));

const isBoxEdge = (column: number, row: number, box: { left: number; right: number; top: number; bottom: number }) =>
	between(column, box.left, box.right) && between(row, box.top, box.bottom) && (column === box.left || column === box.right || row === box.top || row === box.bottom);

// The site as a tree: the domain at the root, a branch to each section, and under each section its pages. A page
// that has been found is an outline full of rings; one chosen for scraping is solid.
const tree = (isChosen: (tile: number) => boolean): DotPainter => (column, row) => {
	if (isBoxEdge(column, row, ROOT)) return DOT_FILLED;
	if (column === ROOT.centre && between(row, ROOT.bottom, BRANCH_ROW)) return DOT_FILLED;
	if (row === BRANCH_ROW && between(column, centreOf(SECTIONS[0].left), centreOf(SECTIONS[SECTIONS.length - 1].left))) return DOT_FILLED;
	const section = SECTIONS.find(({ left }) => between(column, left, left + SECTION.columns - 1));
	if (!section) return DOT_ABSENT;
	if (column === centreOf(section.left) && (between(row, BRANCH_ROW, SECTION.top) || between(row, SECTION.bottom, TILE.tops[0] - 1))) return DOT_FILLED;
	if (isBoxEdge(column, row, { left: section.left, right: section.left + SECTION.columns - 1, top: SECTION.top, bottom: SECTION.bottom })) return DOT_FILLED;
	const tile = tileAt(column, row);
	if (tile < 0) return DOT_ABSENT;
	const isEdge = column === TILES[tile].left || column === TILES[tile].left + TILE.columns - 1 || row === TILES[tile].top || row === TILES[tile].top + TILE.rows - 1;
	return isEdge || isChosen(tile) ? DOT_FILLED : DOT_HOLLOW;
};

const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(SITE_MAP_STORY_GRID, states) });
export const SITE_FOUND = pictureOfStates(paintedStates(SITE_MAP_STORY_GRID, tree(() => false)));
export const SITE_CHOSEN = pictureOfStates(paintedStates(SITE_MAP_STORY_GRID, tree((tile) => CHOSEN_TILES.includes(tile))));
export const CHOSEN_COUNT = CHOSEN_TILES.length;

/** Picks the first `count` of the chosen pages. */
export function paintChosen(states: Uint8Array, count: number) {
	for (let cell = 0; cell < states.length; cell++) {
		const tile = tileAt(cell % COLUMNS, Math.floor(cell / COLUMNS));
		if (tile >= 0 && CHOSEN_TILES.indexOf(tile) < count) states[cell] = SITE_CHOSEN.states[cell];
	}
	return states;
}

export const TREE_LABELS: DotStoryText[] = [
	{ text: DOMAIN_NAME, x: x(ROOT.centre + 0.5), y: baselineOn((ROOT.top + ROOT.bottom) / 2, 16), size: 16, weight: 800, anchor: 'middle' },
	...SECTIONS.map(({ left, path }): DotStoryText => ({ text: path, x: x(centreOf(left) + 0.5), y: baselineOn((SECTION.top + SECTION.bottom) / 2, 15), size: 15, weight: 700, anchor: 'middle' })),
];
const COUNT_LEFT = x(ROOT.right + 3);
export const FOUND_COUNT: DotStoryText = { text: `${TILES.length} pages found`, x: COUNT_LEFT, y: baselineOn(2, 13), size: 13, weight: 700, muted: true };
export const chosenCountText = (count: number): DotStoryText => ({ text: `${count} to scrape`, x: COUNT_LEFT, y: baselineOn(4.6, 13), size: 13, weight: 800 });

/** The mapped site with its pages chosen: what the picture shows before it plays, and instead of playing with reduced motion. */
export const SITE_MAP_RESTING = { ...SITE_CHOSEN, texts: [...TREE_LABELS, FOUND_COUNT, chosenCountText(CHOSEN_COUNT)] };
