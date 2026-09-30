import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, distanceToSegment, isFilledAmongSolids, paintShape, polygon, solidWithSpeckle, type DotShape } from '@/components/ds/ui/dot-story-cells';
import { storyCaption } from '@/components/ds/ui/story-caption';

/**
 * The "Read dynamic pages" card's pictures, in the brand dot grid: the browser actions a scrape can take before it
 * reads, a pointer that clicks, an hourglass that waits and a mouse that scrolls, and the page they leave rendered.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const ACTIONS_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = ACTIONS_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(ACTIONS_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

// Every picture stands in the same place, left of the words that name it.
const CENTRE = 16;
const PICTURE_COLUMNS = 31;

const POINTER = { tip: { column: 8, row: 6 }, click: { from: 2, to: 5.5, width: 0.6 } };
// The arrow's outline, measured from its tip; its two long edges run at 45 degrees, so they step cleanly dot by dot.
const POINTER_OUTLINE = [
	[0, 0],
	[0, 23],
	[5.5, 17.5],
	[9.5, 26],
	[13, 24.5],
	[9, 16.5],
	[16.5, 16.5],
];
const arrow = polygon(
	POINTER_OUTLINE.map(([across, down]) => ({ column: POINTER.tip.column + across, row: POINTER.tip.row + down })),
	solidWithSpeckle
);

/** The pointer, with a click spreading `clicked` of the way out from its tip (none when 0). */
export function paintPointer(states: Uint8Array, clicked: number) {
	const reach = POINTER.click.from + clicked * (POINTER.click.to - POINTER.click.from);
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < PICTURE_COLUMNS; column++) {
			const pointer = arrow(column, row);
			const fromTip = Math.hypot(column - POINTER.tip.column, row - POINTER.tip.row);
			// The click only spreads away from the arrow, up and to the left of its tip.
			const isAhead = column - POINTER.tip.column + (row - POINTER.tip.row) < 1;
			const isClick = clicked > 0 && clicked < 1 && isAhead && Math.abs(fromTip - reach) < POINTER.click.width;
			states[row * COLUMNS + column] = pointer !== DOT_ABSENT ? pointer : isClick ? DOT_HOLLOW : DOT_ABSENT;
		}
	}
	return states;
}

const HOURGLASS = { top: 4, bottom: 33, cap: 2, capHalfWidth: 10, neck: 18.5, neckHalfWidth: 1.2, bulbHalfWidth: 8.6, roundness: 0.75, sand: { from: 10, heap: 8, slope: 0.55 } };
const GLASS = { top: HOURGLASS.top + HOURGLASS.cap, bottom: HOURGLASS.bottom - HOURGLASS.cap };

const glassHalfWidth = (row: number) => HOURGLASS.neckHalfWidth + (HOURGLASS.bulbHalfWidth - HOURGLASS.neckHalfWidth) * (Math.abs(row - HOURGLASS.neck) / (HOURGLASS.neck - GLASS.top)) ** HOURGLASS.roundness;
const isCap: DotShape = (column, row) => (between(row, HOURGLASS.top, GLASS.top - 1) || between(row, GLASS.bottom + 1, HOURGLASS.bottom)) && Math.abs(column - CENTRE) <= HOURGLASS.capHalfWidth;
const isGlass: DotShape = (column, row) => between(row, GLASS.top, GLASS.bottom) && Math.abs(column - CENTRE) <= glassHalfWidth(row);

/** The hourglass with `run` of its sand through: the top drains level, a stream falls, and a heap builds below. */
export function paintHourglass(states: Uint8Array, run: number) {
	const level = HOURGLASS.sand.from + run * (HOURGLASS.neck - HOURGLASS.sand.from);
	const heapTop = GLASS.bottom - 1 - run * HOURGLASS.sand.heap;
	const isSand = (column: number, row: number) => {
		if (row < HOURGLASS.neck) return row >= level;
		if (column === CENTRE && run > 0 && run < 1) return true;
		return row >= heapTop + Math.abs(column - CENTRE) * HOURGLASS.sand.slope;
	};
	states.fill(DOT_ABSENT);
	paintShape(ACTIONS_STORY_GRID, states, isGlass, (column, row) => (isSand(column, row) ? DOT_FILLED : DOT_HOLLOW));
	return paintShape(ACTIONS_STORY_GRID, states, isCap, () => DOT_FILLED);
}

const MOUSE = { spine: { from: 13, to: 24 }, halfWidth: 8.5, wheel: { halfWidth: 1, rows: 4, from: 8, travel: 4 }, chevrons: { from: 18, every: 4, count: 3, halfWidth: 3 } };
const MOUSE_SPINE = { from: { column: CENTRE, row: MOUSE.spine.from }, to: { column: CENTRE, row: MOUSE.spine.to } };
const isMouse: DotShape = (column, row) => distanceToSegment(column, row, MOUSE_SPINE.from, MOUSE_SPINE.to) <= MOUSE.halfWidth;

/** The mouse, its wheel `rolled` of the way down its slot, and the chevrons under it, cut out of its rings, lit one after another. */
export function paintMouse(states: Uint8Array, rolled: number) {
	const wheelTop = MOUSE.wheel.from + Math.round(rolled * MOUSE.wheel.travel);
	const litChevron = Math.min(MOUSE.chevrons.count - 1, Math.floor(rolled * MOUSE.chevrons.count));
	states.fill(DOT_ABSENT);
	return paintShape(ACTIONS_STORY_GRID, states, isMouse, (column, row) => {
		const across = Math.abs(column - CENTRE);
		if (across <= MOUSE.wheel.halfWidth && between(row, wheelTop, wheelTop + MOUSE.wheel.rows - 1)) return DOT_FILLED;
		const chevron = Math.floor((row + across - MOUSE.chevrons.from) / MOUSE.chevrons.every);
		const isChevron = across <= MOUSE.chevrons.halfWidth && (row + across - MOUSE.chevrons.from) % MOUSE.chevrons.every === 0 && between(chevron, 0, MOUSE.chevrons.count - 1);
		if (!isChevron) return DOT_HOLLOW;
		return chevron === litChevron ? DOT_FILLED : DOT_ABSENT;
	});
}

const PAGE = { left: 5, right: 27, top: 3, bottom: 33, titleBarBottom: 6, buttons: { row: 5, columns: [7, 9, 11] } };
const PAGE_BODY = { left: PAGE.left + 2, right: PAGE.right - 2, top: PAGE.titleBarBottom + 2, bottom: PAGE.bottom - 2 };
const TICK = { centre: { column: 25, row: 30 }, radius: 5.2, from: { column: 22.4, row: 30.2 }, corner: { column: 24.2, row: 32 }, to: { column: 27.8, row: 27.6 }, width: 0.75 };

// A pricing page: a heading, a picture, two lines of copy, three plans and a button.
const isContent = (column: number, row: number) => {
	const across = column - PAGE_BODY.left;
	const down = row - PAGE_BODY.top;
	if (between(down, 0, 1)) return across <= 11;
	if (between(down, 3, 8)) return true;
	if (down === 10) return across <= 15;
	if (down === 12) return across <= 11;
	if (between(down, 14, 19)) return across % 7 <= 4;
	if (between(down, 21, 22)) return across <= 7;
	return false;
};
const isPage: DotShape = (column, row) => between(column, PAGE.left, PAGE.right) && between(row, PAGE.top, PAGE.bottom);
const isTickBadge: DotShape = (column, row) => Math.hypot(column - TICK.centre.column, row - TICK.centre.row) <= TICK.radius;
const isTick = (column: number, row: number) => Math.min(distanceToSegment(column, row, TICK.from, TICK.corner), distanceToSegment(column, row, TICK.corner, TICK.to)) < TICK.width;

/** The page, its content either still loading (rings) or rendered (solid, with the tick that says so). */
function paintPage(states: Uint8Array, isRendered: boolean) {
	paintShape(ACTIONS_STORY_GRID, states, isPage, (column, row) => {
		if (row <= PAGE.titleBarBottom) return row === PAGE.buttons.row && PAGE.buttons.columns.includes(column) ? DOT_HOLLOW : DOT_FILLED;
		if (!between(column, PAGE_BODY.left, PAGE_BODY.right) || !isContent(column, row)) return DOT_ABSENT;
		return isRendered && isFilledAmongSolids(column, row) ? DOT_FILLED : DOT_HOLLOW;
	});
	if (isRendered) paintShape(ACTIONS_STORY_GRID, states, isTickBadge, (column, row) => (isTick(column, row) ? DOT_HOLLOW : DOT_FILLED));
	return states;
}

/** How far through rendering a dot is reached: the page fills in from its top down. */
export const renderingOrder = (_column: number, row: number) => Math.min(1, Math.max(0, (row - PAGE_BODY.top) / (PAGE.bottom + 2 - PAGE_BODY.top)));

export const POINTER_AT_REST = pictureOfStates(paintPointer(blank(), 0));
export const HOURGLASS_AT_REST = pictureOfStates(paintHourglass(blank(), 0));
export const HOURGLASS_RUN_OUT = pictureOfStates(paintHourglass(blank(), 1));
export const MOUSE_AT_REST = pictureOfStates(paintMouse(blank(), 0));
export const PAGE_LOADING = pictureOfStates(paintPage(blank(), false));
export const PAGE_RENDERED = pictureOfStates(paintPage(blank(), true));

export const CAPTIONS = {
	click: storyCaption(ACTIONS_STORY_GRID, 33, 'action 1', 'click', '"Show all plans"'),
	wait: storyCaption(ACTIONS_STORY_GRID, 33, 'action 2', 'wait', 'for the prices to load'),
	scroll: storyCaption(ACTIONS_STORY_GRID, 33, 'action 3', 'scroll', 'to the end of the page'),
	scrape: storyCaption(ACTIONS_STORY_GRID, 33, 'then', 'scrape', 'the page, fully rendered'),
};

/** The rendered page: what the picture shows before it plays, and instead of playing with reduced motion. */
export const ACTIONS_RESTING = { ...PAGE_RENDERED, texts: CAPTIONS.scrape };
