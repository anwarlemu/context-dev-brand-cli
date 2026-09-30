import { storyCaption } from '@/components/ds/ui/story-caption';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, isInDotBox, paintShape, roundedBox, type DotBox } from '@/components/ds/ui/dot-story-cells';

/**
 * The "Spacing and depth" card's pictures, in the brand dot grid: two blocks with the gap between them measured at
 * each step of the site's spacing scale, and a card lifted further and further off the page by its shadow.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const SPACING_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = SPACING_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(SPACING_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const BLOCK = { left: 4, right: 24, rows: 8, top: 4, radius: 2 };
const MEASURE = { column: 28, serif: 1 };
/** The steps of the spacing scale: how many rows each opens between the blocks, and its value on the site. */
export const SPACES = [
	{ rows: 2, value: '4px' },
	{ rows: 4, value: '8px' },
	{ rows: 8, value: '16px' },
	{ rows: 12, value: '24px' },
];

/** Two blocks `gap` rows apart, with a measure beside the gap: a line between two serifs. */
export function paintSpacing(states: Uint8Array, gap: number) {
	const upper: DotBox = { left: BLOCK.left, right: BLOCK.right, top: BLOCK.top, bottom: BLOCK.top + BLOCK.rows - 1 };
	const lower: DotBox = { ...upper, top: upper.bottom + gap + 1, bottom: upper.bottom + gap + BLOCK.rows };
	states.fill(DOT_ABSENT);
	paintShape(SPACING_STORY_GRID, states, roundedBox(upper, BLOCK.radius), () => DOT_HOLLOW);
	paintShape(SPACING_STORY_GRID, states, roundedBox(lower, BLOCK.radius), () => DOT_HOLLOW);
	for (let row = upper.bottom; row <= lower.top; row++) {
		const isSerif = row === upper.bottom || row === lower.top;
		for (let column = MEASURE.column - (isSerif ? MEASURE.serif : 0); column <= MEASURE.column + (isSerif ? MEASURE.serif : 0); column++) states[row * COLUMNS + column] = DOT_FILLED;
	}
	return states;
}

export const SPACING_TIGHT = pictureOfStates(paintSpacing(blank(), SPACES[0].rows));
export const SPACING_LOOSE = pictureOfStates(paintSpacing(blank(), SPACES[SPACES.length - 1].rows));

const CARD: DotBox = { left: 5, right: 21, top: 6, bottom: 22 };
const CARD_RADIUS = 2;
const CARD_TITLE = { rows: [10, 11], left: 8, right: 15 };
const CARD_LINES = [
	{ row: 15, right: 18 },
	{ row: 18, right: 16 },
];
/** How far each shadow throws: the card's shadow lies that many dots down and to the right of it. */
export const SHADOWS = [
	{ offset: 1, name: 'sm', css: '0 1px 2px' },
	{ offset: 3, name: 'md', css: '0 4px 12px' },
	{ offset: 6, name: 'lg', css: '0 12px 32px' },
];

/** A card and the shadow it throws `offset` dots down and to the right: rings, thinning towards the shadow's edge. */
export function paintDepth(states: Uint8Array, offset: number) {
	const shadow = roundedBox({ left: CARD.left + offset, right: CARD.right + offset, top: CARD.top + offset, bottom: CARD.bottom + offset }, CARD_RADIUS + 1);
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS / 2 + 3; column++) {
			const fromEdge = Math.min(CARD.right + offset - column, CARD.bottom + offset - row);
			// The last two rows of a long shadow keep every other dot, so it fades out rather than ending in a line.
			const isThinned = offset > 2 && fromEdge < 2 && (column + row) % 2 === 1;
			states[row * COLUMNS + column] = shadow(column, row) && !isThinned ? DOT_HOLLOW : DOT_ABSENT;
		}
	}
	return paintShape(SPACING_STORY_GRID, states, roundedBox(CARD, CARD_RADIUS), (column, row) => {
		if (CARD_TITLE.rows.includes(row) && between(column, CARD_TITLE.left, CARD_TITLE.right)) return DOT_FILLED;
		return CARD_LINES.some((line) => line.row === row && between(column, CARD_TITLE.left, line.right)) && isInDotBox(CARD, column, row) ? DOT_HOLLOW : DOT_ABSENT;
	});
}

export const DEPTH_LOW = pictureOfStates(paintDepth(blank(), SHADOWS[0].offset));
export const DEPTH_HIGH = pictureOfStates(paintDepth(blank(), SHADOWS[SHADOWS.length - 1].offset));

const caption = (label: string, value: string, detail: string) => storyCaption(SPACING_STORY_GRID, 35, label, value, detail);
export const SPACING_CAPTIONS = SPACES.map(({ value }) => caption('spacing', value, 'scale: 4, 8, 16, 24'));
export const DEPTH_CAPTIONS = SHADOWS.map(({ name, css }) => caption('shadow', name, css));

/** The card at its highest: what the picture shows before it plays, and instead of playing with reduced motion. */
export const SPACING_RESTING = { ...DEPTH_HIGH, texts: DEPTH_CAPTIONS[DEPTH_CAPTIONS.length - 1] };
