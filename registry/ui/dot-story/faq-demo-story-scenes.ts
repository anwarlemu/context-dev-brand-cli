import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { clear, polygon, ringsWithSpeckle, solidWithSpeckle, stack, type DotPainter, type GridPoint } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The FAQ invite's pictures, in the brand dot grid: a banner asking for questions and the paper plane it becomes,
 * which flies off from the bottom left to the top right.
 */

// The picture covers the whole of its ring pattern, so the plane can leave by the pattern's own corner; the halo is
// what clears the pattern from around its dots.
export const FAQ_DEMO_STORY_GRID: DotGrid = { columns: 56, rows: 42, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 14 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = FAQ_DEMO_STORY_GRID;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const middleOf = (from: number, to: number) => ((from + to) / 2 + 0.5) * PITCH;
const centreOf = (index: number) => (index + 0.5) * PITCH;

// Its bottom edge sits on the grid's last row, level with the foot of the FAQ list beside it.
const BANNER = { left: 3, right: 46, top: 29, bottom: 41, tail: 5 };
const BANNER_MIDDLE = (BANNER.top + BANNER.bottom) / 2;
export const BANNER_ORIGIN: GridPoint = { column: BANNER.left, row: BANNER_MIDDLE };

// A ribbon with a swallowtail cut into each end: a plain box read as another button.
const BANNER_CORNERS: GridPoint[] = [
	{ column: BANNER.left, row: BANNER.top },
	{ column: BANNER.right, row: BANNER.top },
	{ column: BANNER.right - BANNER.tail, row: BANNER_MIDDLE },
	{ column: BANNER.right, row: BANNER.bottom },
	{ column: BANNER.left, row: BANNER.bottom },
	{ column: BANNER.left + BANNER.tail, row: BANNER_MIDDLE },
];
const banner = (interior: DotPainter) => polygon(BANNER_CORNERS, interior);
/** The banner's inside as a path in grid units, for clearing the ring pattern from behind its question. */
export const BANNER_INSIDE = `M${BANNER_CORNERS.map(({ column, row }) => `${centreOf(column)} ${centreOf(row)}`).join('L')}Z`;

export const BANNER_FILLED = pictureOf(FAQ_DEMO_STORY_GRID, banner(ringsWithSpeckle));
export const BANNER_OPEN = pictureOf(FAQ_DEMO_STORY_GRID, banner(clear));
export const bannerShare = (column: number) => (column - BANNER.left) / (BANNER.right - BANNER.left);

// Doto is monospaced, each letter three fifths of its size wide.
const DOTO_ADVANCE = 0.6;
const QUESTION_TEXT = 'Ask anything';
const QUESTION_SIZE = 30;
// Set from its left edge, not its middle: it is typed, and the cursor stands at the end of what has been typed so far.
export const QUESTION: DotStoryText = { text: QUESTION_TEXT, x: middleOf(BANNER.left, BANNER.right) - ((QUESTION_TEXT.length + 1) * DOTO_ADVANCE * QUESTION_SIZE) / 2, y: baselineOn(BANNER_MIDDLE, QUESTION_SIZE), size: QUESTION_SIZE, weight: 800 };

const PLANE = { left: 8, top: 17 };
const planePoint = (column: number, row: number): GridPoint => ({ column: PLANE.left + column, row: PLANE.top + row });
const NOSE = planePoint(24, 0);
const WING_TIP = planePoint(0, 9);
const FOLD = planePoint(9, 13);
const KEEL = planePoint(13, 20);

// The wing seen from above is solid and the keel beneath it rings, which is what makes the fold read as a fold.
const plane = stack(polygon([WING_TIP, NOSE, FOLD], solidWithSpeckle), polygon([FOLD, NOSE, KEEL], ringsWithSpeckle));
export const PLANE_AT_REST: StoryPicture = pictureOf(FAQ_DEMO_STORY_GRID, plane);

export const EMPTY = pictureOf(FAQ_DEMO_STORY_GRID, clear);

// The way out is shallower than the plane's own heading, so it leaves by the top right corner and not through the top.
const CLIMB = 0.72;
const TRAIL = { every: 3, columns: 21, gap: 2 };
/** Far enough that the plane and the trail behind it have both left the grid. */
export const FLIGHT_COLUMNS = COLUMNS - PLANE.left + TRAIL.columns;

const isOnGrid = (column: number, row: number) => column >= 0 && column < COLUMNS && row >= 0 && row < ROWS;

/** The plane `travelled` columns along its way out, with the trail it leaves behind its fold. */
export function paintFlight(states: Uint8Array, travelled: number) {
	// Whole cells, so the plane keeps its shape as it moves instead of being redrawn a little differently each frame.
	const across = Math.round(travelled);
	const up = Math.round(travelled * CLIMB);
	states.fill(DOT_ABSENT);

	for (let step = Math.max(0, across - TRAIL.columns); step <= across - TRAIL.gap; step++) {
		if (step % TRAIL.every !== 0) continue;
		const column = FOLD.column - 1 + step;
		const row = FOLD.row + 1 - Math.round(step * CLIMB);
		if (isOnGrid(column, row)) states[row * COLUMNS + column] = DOT_HOLLOW;
	}
	for (const cell of PLANE_AT_REST.cells) {
		const column = cell.column + across;
		const row = cell.row - up;
		if (isOnGrid(column, row)) states[row * COLUMNS + column] = cell.filled ? DOT_FILLED : DOT_HOLLOW;
	}
	return states;
}

/** The banner with its question: what the picture shows before it plays, and instead of playing with reduced motion. */
export const FAQ_DEMO_RESTING = { ...BANNER_OPEN, texts: [QUESTION], clearedPath: BANNER_INSIDE };
