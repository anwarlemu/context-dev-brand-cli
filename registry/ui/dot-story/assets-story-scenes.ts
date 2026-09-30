// ds-override: example output data, a third-party palette the story shows being extracted
import { storyCaption } from '@/components/ds/ui/story-caption';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, isInDotBox, paintShape, rings, ringsWithSpeckle, solid, solidWithSpeckle, roundedBox, type DotBox, type DotPainter } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Get the visual assets" card's pictures, in the brand dot grid: a brand's logo on its tile, its colors as a
 * row of swatches, and a company profile dressed in both.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const ASSETS_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = ASSETS_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(ASSETS_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

type Box = DotBox;
const isInBox = isInDotBox;

// A made-up mark, so no real company's logo is redrawn: a square with a disc over its corner, where they overlap in rings.
const markIn = (tile: Box): DotPainter => {
	const size = tile.right - tile.left;
	const square: Box = { left: tile.left + Math.round(size * 0.4), right: tile.left + Math.round(size * 0.78), top: tile.top + Math.round(size * 0.2), bottom: tile.top + Math.round(size * 0.58) };
	const disc = { column: tile.left + size * 0.4, row: tile.top + size * 0.6, radius: size * 0.22 };
	return (column, row) => {
		const isOnDisc = Math.hypot(column - disc.column, row - disc.row) <= disc.radius;
		const isOnSquare = isInBox(square, column, row);
		if (isOnDisc && isOnSquare) return DOT_HOLLOW;
		return isOnDisc || isOnSquare ? DOT_FILLED : DOT_ABSENT;
	};
};
const withBackdrop = (mark: DotPainter, backdrop: DotPainter): DotPainter => (column, row) => {
	const state = mark(column, row);
	return state === DOT_ABSENT ? backdrop(column, row) : state;
};

const LOGO_TILE: Box = { left: 5, right: 27, top: 8, bottom: 30 };
const clearAround = (mark: DotPainter): DotPainter => (column, row) => {
	const state = mark(column, row);
	if (state !== DOT_ABSENT) return state;
	const isBesideMark = [-1, 0, 1].some((across) => [-1, 0, 1].some((down) => mark(column + across, row + down) !== DOT_ABSENT));
	return isBesideMark ? DOT_ABSENT : DOT_HOLLOW;
};
export const LOGO = pictureOfStates(paintShape(ASSETS_STORY_GRID, blank(), roundedBox(LOGO_TILE, 4), clearAround(markIn(LOGO_TILE))));
export const LOGO_CAPTION = storyCaption(ASSETS_STORY_GRID, 34, 'logos', 'SVG', 'icon and wordmark');

const SWATCH = { top: 6, bottom: 22, columns: 12, every: 14, left: 2, radius: 2 };
// Four tones, darkest to lightest, told apart by how many of their dots are solid.
const SWATCHES = [
	{ hex: '#1A1F36', role: 'primary', tone: solid },
	{ hex: '#5E8E3E', role: 'accent', tone: solidWithSpeckle },
	{ hex: '#95BF47', role: 'light', tone: ringsWithSpeckle },
	{ hex: '#F4F6F8', role: 'surface', tone: rings },
];
const swatchBox = (index: number): Box => ({ left: SWATCH.left + index * SWATCH.every, right: SWATCH.left + index * SWATCH.every + SWATCH.columns - 1, top: SWATCH.top, bottom: SWATCH.bottom });

const paletteStates = blank();
SWATCHES.forEach(({ tone }, index) => paintShape(ASSETS_STORY_GRID, paletteStates, roundedBox(swatchBox(index), SWATCH.radius), tone));
export const PALETTE = pictureOfStates(paletteStates);
export const SWATCH_TEXTS: DotStoryText[][] = SWATCHES.map(({ hex, role }, index) => [
	{ text: hex, x: x(swatchBox(index).left), y: baselineOn(SWATCH.bottom + 3, 15), size: 15, weight: 800 },
	{ text: role, x: x(swatchBox(index).left), y: baselineOn(SWATCH.bottom + 5.5, 12), size: 12, weight: 700, muted: true },
]);

const PROFILE: Box = { left: 5, right: 52, top: 3, bottom: 33 };
const BANNER_BOTTOM = 12;
const AVATAR: Box = { left: 9, right: 21, top: 8, bottom: 20 };
const BUTTON: Box = { left: 38, right: 48, top: 16, bottom: 19 };
const COPY_LINES = [
	{ row: 28, to: 44 },
	{ row: 30, to: 36 },
];

// A company's profile page: a banner in its color, its logo on the avatar, a follow button, and room for its name.
const profile: DotPainter = (column, row) => {
	if (roundedBox(AVATAR, 2)(column, row)) {
		const isEdge = !roundedBox(AVATAR, 2)(column - 1, row) || !roundedBox(AVATAR, 2)(column + 1, row) || !roundedBox(AVATAR, 2)(column, row - 1) || !roundedBox(AVATAR, 2)(column, row + 1);
		return isEdge ? DOT_FILLED : withBackdrop(markIn(AVATAR), () => DOT_ABSENT)(column, row);
	}
	if (row <= BANNER_BOTTOM) return isInBox({ ...AVATAR, left: AVATAR.left - 1, right: AVATAR.right + 1, top: AVATAR.top - 1 }, column, row) ? DOT_ABSENT : solidWithSpeckle(column, row);
	if (isInBox(BUTTON, column, row)) return DOT_FILLED;
	const line = COPY_LINES.find((candidate) => candidate.row === row);
	return line && between(column, AVATAR.left, line.to) ? DOT_HOLLOW : DOT_ABSENT;
};

export const PROFILE_PICTURE = pictureOf(ASSETS_STORY_GRID, (column, row) => {
	if (!isInBox(PROFILE, column, row)) return DOT_ABSENT;
	return column === PROFILE.left || column === PROFILE.right || row === PROFILE.top || row === PROFILE.bottom ? DOT_FILLED : profile(column, row);
});
export const PROFILE_TEXTS: DotStoryText[] = [
	{ text: 'Shopify', x: x(AVATAR.left), y: baselineOn(23, 22), size: 22, weight: 900 },
	{ text: 'shopify.com', x: x(AVATAR.left), y: baselineOn(25.5, 13), size: 13, weight: 700, muted: true },
];

/** The profile: what the picture shows before it plays, and instead of playing with reduced motion. */
export const ASSETS_RESTING = { ...PROFILE_PICTURE, texts: PROFILE_TEXTS };
