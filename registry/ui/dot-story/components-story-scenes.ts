import { storyCaption } from '@/components/ds/ui/story-caption';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, distanceToSegment, isFilledAmongSolids, paintShape, roundedBox, solidWithSpeckle, type DotBox, type DotShape } from '@/components/ds/ui/dot-story-cells';

/**
 * The "Component details" card's pictures, in the brand dot grid: a button whose corners round to the site's
 * radius, a card built the way the site builds them, and the theme the site is in, a sun for light and a moon for dark.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const COMPONENTS_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = COMPONENTS_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(COMPONENTS_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;
const CENTRE = { column: 16, row: 19 };

const BUTTON: DotBox = { left: 3, right: 29, top: 13, bottom: 24 };
const BUTTON_LABEL = { rows: [18, 19], left: 10, right: 22 };
/** The button's corner, in dots, at the site's radius: between square and a full pill. */
export const SITE_RADIUS = 3;

/** The button with its corners rounded to `radius` dots; its label is cut out of it in rings. */
export function paintButton(states: Uint8Array, radius: number) {
	states.fill(DOT_ABSENT);
	return paintShape(COMPONENTS_STORY_GRID, states, roundedBox(BUTTON, radius), (column, row) => (BUTTON_LABEL.rows.includes(row) && between(column, BUTTON_LABEL.left, BUTTON_LABEL.right) ? DOT_HOLLOW : DOT_FILLED));
}

export const BUTTON_SQUARE = pictureOfStates(paintButton(blank(), 0));
export const BUTTON_ROUNDED = pictureOfStates(paintButton(blank(), SITE_RADIUS));

const CARD: DotBox = { left: 5, right: 27, top: 4, bottom: 33 };
const CARD_PARTS = { radius: 3, media: { top: 6, bottom: 16 }, inset: 3, title: { rows: [19, 20], right: 19 }, lines: [{ row: 23, right: 23 }, { row: 25, right: 20 }], action: { top: 28, bottom: 30, right: 15 } };

// A card as the site builds them: a picture, a title, two lines of copy and an action.
export const CARD_PICTURE = pictureOfStates(
	paintShape(COMPONENTS_STORY_GRID, blank(), roundedBox(CARD, CARD_PARTS.radius), (column, row) => {
		const isInset = between(column, CARD.left + CARD_PARTS.inset, CARD.right - CARD_PARTS.inset);
		if (!isInset) return DOT_ABSENT;
		if (between(row, CARD_PARTS.media.top, CARD_PARTS.media.bottom)) return solidWithSpeckle(column, row);
		if (CARD_PARTS.title.rows.includes(row)) return column <= CARD_PARTS.title.right ? DOT_FILLED : DOT_ABSENT;
		if (CARD_PARTS.lines.some((line) => line.row === row && column <= line.right)) return DOT_HOLLOW;
		return between(row, CARD_PARTS.action.top, CARD_PARTS.action.bottom) && column <= CARD_PARTS.action.right ? DOT_FILLED : DOT_ABSENT;
	})
);

const SUN = { radius: 6.2, rays: 8, rayFrom: 8.6, rayTo: 12.4, rayWidth: 0.8 };
const isSunDisc: DotShape = (column, row) => Math.hypot(column - CENTRE.column, row - CENTRE.row) <= SUN.radius;
const isRay = (column: number, row: number, turned: number) =>
	Array.from({ length: SUN.rays }, (_, ray) => turned + (ray / SUN.rays) * Math.PI * 2).some(
		(angle) =>
			distanceToSegment(column, row, { column: CENTRE.column + SUN.rayFrom * Math.cos(angle), row: CENTRE.row + SUN.rayFrom * Math.sin(angle) }, { column: CENTRE.column + SUN.rayTo * Math.cos(angle), row: CENTRE.row + SUN.rayTo * Math.sin(angle) }) < SUN.rayWidth
	);
/** How far the sun's rays turn before it looks the same again: from one ray to the next. */
export const SUN_TURN = (Math.PI * 2) / SUN.rays;

/** The light theme's sun, its rays turned `turned` radians. */
export function paintSun(states: Uint8Array, turned: number) {
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS / 2 + 2; column++) states[row * COLUMNS + column] = isRay(column, row, turned) ? DOT_FILLED : DOT_ABSENT;
	}
	return paintShape(COMPONENTS_STORY_GRID, states, isSunDisc, (column, row) => (isFilledAmongSolids(column, row) ? DOT_FILLED : DOT_HOLLOW));
}

export const SUN_AT_REST = pictureOfStates(paintSun(blank(), 0));

const MOON = { radius: 11.5, bite: { across: 6, up: 4.5, radius: 10 }, stars: [{ column: 25, row: 9 }, { column: 28, row: 17 }] };
const isMoon: DotShape = (column, row) =>
	Math.hypot(column - CENTRE.column + 2, row - CENTRE.row) <= MOON.radius && Math.hypot(column - CENTRE.column + 2 - MOON.bite.across, row - CENTRE.row + MOON.bite.up) > MOON.bite.radius;

/** The dark theme's crescent moon, with its first `stars` stars out: each a small cross. */
export function paintMoon(states: Uint8Array, stars: number) {
	states.fill(DOT_ABSENT);
	MOON.stars.slice(0, stars).forEach(({ column, row }) => {
		for (const [across, down] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) states[(row + down) * COLUMNS + column + across] = DOT_FILLED;
	});
	return paintShape(COMPONENTS_STORY_GRID, states, isMoon, solidWithSpeckle);
}

export const STAR_COUNT = MOON.stars.length;
export const MOON_AT_REST = pictureOfStates(paintMoon(blank(), 0));
export const MOON_WITH_STARS = pictureOfStates(paintMoon(blank(), STAR_COUNT));

const caption = (label: string, value: string, detail: string) => storyCaption(COMPONENTS_STORY_GRID, 35, label, value, detail);
export const SITE_RADIUS_PX = 8;
export const CAPTIONS = {
	button: caption('button radius', `${SITE_RADIUS_PX}px`, 'padding 8px 16px'),
	card: caption('component', 'card', 'radius, border, shadow'),
	light: caption('theme', 'light', 'as the site renders it'),
	dark: caption('theme', 'dark', 'fonts linked, too'),
};
/** The card: what the picture shows before it plays, and instead of playing with reduced motion. */
export const COMPONENTS_RESTING = { ...CARD_PICTURE, texts: CAPTIONS.card };
