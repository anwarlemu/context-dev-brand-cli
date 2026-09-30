import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, paintedStates, type DotPainter } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Choose the structure" card's pictures, in the brand dot grid: what the web says, as a ragged paragraph, and
 * the shape it is asked for in, a tree of named fields that are empty until the answer fills them.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const STRUCTURE_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, pitch: PITCH } = STRUCTURE_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const between = (value: number, from: number, to: number) => value >= from && value <= to;
const hashOf = (a: number, b: number) => {
	const hash = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
	return hash - Math.floor(hash);
};

const PROSE = { left: 4, top: 3, bottom: 29, every: 2, shortest: 30, raggedness: 20, wordColumns: 5, gapRate: 0.2, boldRate: 0.16 };

// A paragraph set ragged right: words of rings with gaps between them, a few in bold, and a short last line.
const prose: DotPainter = (column, row) => {
	const down = row - PROSE.top;
	if (!between(row, PROSE.top, PROSE.bottom) || down % PROSE.every !== 0 || column < PROSE.left) return DOT_ABSENT;
	const line = down / PROSE.every;
	const isLastLine = row + PROSE.every > PROSE.bottom;
	const lineEnd = PROSE.left + (isLastLine ? PROSE.shortest / 2 : PROSE.shortest + Math.floor(hashOf(line, 7) * PROSE.raggedness));
	if (column > lineEnd) return DOT_ABSENT;
	const word = Math.floor((column + line * 3) / PROSE.wordColumns);
	if ((column + line * 3) % PROSE.wordColumns === 0 && hashOf(word, line) < 1 - PROSE.gapRate) return DOT_ABSENT;
	return hashOf(line, word) < PROSE.boldRate ? DOT_FILLED : DOT_HOLLOW;
};

export const PROSE_PICTURE = pictureOf(STRUCTURE_STORY_GRID, prose);
export const PROSE_LABEL: DotStoryText = { text: 'what the web says, as written', x: x(COLUMNS / 2), y: baselineOn(33.5, 14), size: 14, weight: 700, muted: true, anchor: 'middle' };

const FIELD = { left: 7, right: 54, rows: 8, tops: [5, 16, 27], divider: 25, valid: { column: 51, rows: [3, 4] } };
const TRUNK = { column: 3, root: { top: 1, bottom: 3, halfWidth: 1 } };
const FIELDS = [
	{ key: 'company', value: '"Linear"' },
	{ key: 'per_seat', value: '16.00' },
	{ key: 'free_plan', value: 'true' },
];
const branchRow = (top: number) => top + FIELD.rows / 2;

export const fieldAt = (row: number) => FIELD.tops.findIndex((top) => between(row, top, top + FIELD.rows - 1));
/** How far along its field a dot of the value's slot is, from 0 to 1, or -1 if it is not in one. */
export const alongValue = (column: number) => (between(column, FIELD.divider + 1, FIELD.right - 1) ? (column - FIELD.divider) / (FIELD.right - FIELD.divider) : -1);

// The shape as a tree: a root, a trunk, and a branch to each field. A field is a box with its key on the left and a
// slot for its value on the right, full of rings while it is empty; filled, the slot is clear for the value and a
// solid mark says it matched its type.
const shape = (isFilled: (field: number) => boolean): DotPainter => (column, row) => {
	if (between(row, TRUNK.root.top, TRUNK.root.bottom) && Math.abs(column - TRUNK.column) <= TRUNK.root.halfWidth) return DOT_FILLED;
	if (column === TRUNK.column && between(row, TRUNK.root.bottom, branchRow(FIELD.tops[FIELD.tops.length - 1]))) return DOT_FILLED;
	const field = fieldAt(row);
	if (field < 0) return DOT_ABSENT;
	const down = row - FIELD.tops[field];
	if (column < FIELD.left) return down === FIELD.rows / 2 && column > TRUNK.column ? DOT_FILLED : DOT_ABSENT;
	if (column > FIELD.right) return DOT_ABSENT;
	if (column === FIELD.left || column === FIELD.right || column === FIELD.divider || down === 0 || down === FIELD.rows - 1) return DOT_FILLED;
	if (column < FIELD.divider) return DOT_ABSENT;
	if (!isFilled(field)) return DOT_HOLLOW;
	return column >= FIELD.valid.column && column <= FIELD.valid.column + 1 && FIELD.valid.rows.includes(down) ? DOT_FILLED : DOT_ABSENT;
};

export const SHAPE_EMPTY = pictureOf(STRUCTURE_STORY_GRID, shape(() => false));
export const SHAPE_FILLED = pictureOf(STRUCTURE_STORY_GRID, shape(() => true));
const FILLED_STATES = paintedStates(STRUCTURE_STORY_GRID, shape(() => true));

/** The shape with each field's slot cleared `filled[field]` of the way along, from the key outwards. */
export function paintFields(states: Uint8Array, filled: number[]) {
	for (let cell = 0; cell < states.length; cell++) {
		const field = fieldAt(Math.floor(cell / COLUMNS));
		const along = alongValue(cell % COLUMNS);
		if (field >= 0 && along >= 0 && along <= filled[field]) states[cell] = FILLED_STATES[cell];
	}
	return states;
}

export const FIELD_TEXTS = FIELDS.map(({ key, value }, index) => ({
	key: { text: key, x: x(FIELD.left + 2.5), y: baselineOn(FIELD.tops[index] + 3.5, 16), size: 16, weight: 700, muted: true } satisfies DotStoryText,
	value: { text: value, x: x(FIELD.divider + 2.5), y: baselineOn(FIELD.tops[index] + 3.5, 17), size: 17, weight: 800 } satisfies DotStoryText,
}));

const restingPicture: StoryPicture = { states: FILLED_STATES, cells: cellsOfStates(STRUCTURE_STORY_GRID, FILLED_STATES) };
/** The shape, filled: what the picture shows before it plays, and instead of playing with reduced motion. */
export const STRUCTURE_RESTING = { ...restingPicture, texts: FIELD_TEXTS.flatMap(({ key, value }) => [key, value]) };
