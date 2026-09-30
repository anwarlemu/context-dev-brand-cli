import { storyCaption } from '@/components/ds/ui/story-caption';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, distanceToSegment, isFilledAmongSolids, paintShape, solidWithSpeckle, type DotShape } from '@/components/ds/ui/dot-story-cells';

/**
 * The "Add company context" card's pictures, in the brand dot grid: the company as its building, its social links
 * as a small network, and the profile card the rest of its fields fill in.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const CONTEXT_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = CONTEXT_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(CONTEXT_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const BUILDING = { left: 7, right: 25, top: 6, bottom: 33, roof: { left: 5, right: 27, top: 4 }, windows: { columns: [10, 15, 20], width: 2, top: 9, every: 4, floors: 5 }, door: { left: 14, right: 18, top: 28 } };
const isBuilding: DotShape = (column, row) => (between(column, BUILDING.left, BUILDING.right) && between(row, BUILDING.top, BUILDING.bottom)) || (between(column, BUILDING.roof.left, BUILDING.roof.right) && between(row, BUILDING.roof.top, BUILDING.top));
const floorOf = (row: number) => (row - BUILDING.windows.top) / BUILDING.windows.every;
const isWindow = (column: number, row: number) => between(Math.floor(floorOf(row)), 0, BUILDING.windows.floors - 1) && (row - BUILDING.windows.top) % BUILDING.windows.every < 2 && BUILDING.windows.columns.some((from) => between(column, from, from + BUILDING.windows.width - 1));

/** The company's building with its first `lit` floors lit from the top: a lit window is clear, a dark one a ring. */
export function paintBuilding(states: Uint8Array, lit: number) {
	return paintShape(CONTEXT_STORY_GRID, states, isBuilding, (column, row) => {
		if (row >= BUILDING.door.top && between(column, BUILDING.door.left, BUILDING.door.right)) return column === BUILDING.door.left || column === BUILDING.door.right || row === BUILDING.door.top ? DOT_FILLED : DOT_ABSENT;
		if (isWindow(column, row)) return Math.floor(floorOf(row)) < lit ? DOT_ABSENT : DOT_HOLLOW;
		// The wall is plain solid: speckled, its stray rings could not be told from the dark windows.
		return DOT_FILLED;
	});
}

export const FLOORS = BUILDING.windows.floors;
export const BUILDING_DARK = pictureOfStates(paintBuilding(blank(), 0));
export const BUILDING_LIT = pictureOfStates(paintBuilding(blank(), FLOORS));

const NODE_RADIUS = 4.6;
// Three profiles joined like a share mark: one on the left, two on the right.
const NODES = [
	{ column: 8, row: 19 },
	{ column: 24, row: 9 },
	{ column: 24, row: 29 },
];
const LINKS = [
	[0, 1],
	[0, 2],
];
const LINK_WIDTH = 0.9;
const nodeAt = (column: number, row: number) => NODES.findIndex((node) => Math.hypot(column - node.column, row - node.row) <= NODE_RADIUS);
const isNode: DotShape = (column, row) => nodeAt(column, row) >= 0;

/** The social links, the first `linked` of them found: a found profile is solid and the line to it is drawn. */
export function paintNetwork(states: Uint8Array, linked: number) {
	states.fill(DOT_ABSENT);
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS / 2; column++) {
			const link = LINKS.find(([from, to]) => distanceToSegment(column, row, NODES[from], NODES[to]) < LINK_WIDTH);
			if (link) states[row * COLUMNS + column] = link[1] < linked ? DOT_FILLED : DOT_HOLLOW;
		}
	}
	return paintShape(CONTEXT_STORY_GRID, states, isNode, (column, row) => (nodeAt(column, row) < linked && isFilledAmongSolids(column, row) ? DOT_FILLED : DOT_HOLLOW));
}

export const NODE_COUNT = NODES.length;
export const NETWORK_UNLINKED = pictureOfStates(paintNetwork(blank(), 1));
export const NETWORK_LINKED = pictureOfStates(paintNetwork(blank(), NODE_COUNT));

const CARD = { left: 3, right: 29, top: 4, bottom: 33, avatar: { column: 9.5, row: 10.5, radius: 3.6 }, name: { rows: [9, 10], left: 15, right: 25 }, handle: { row: 12, left: 15, right: 22 }, rule: 16, fields: { top: 19, every: 3, key: { left: 6, right: 10 }, value: { left: 13, ends: [26, 22, 25, 19, 24] } } };
const isCard: DotShape = (column, row) => between(column, CARD.left, CARD.right) && between(row, CARD.top, CARD.bottom);

/** The profile card with its first `filled` fields in: a field's key is always there, its value a ring until it is filled. */
export function paintProfile(states: Uint8Array, filled: number) {
	return paintShape(CONTEXT_STORY_GRID, states, isCard, (column, row) => {
		if (Math.hypot(column - CARD.avatar.column, row - CARD.avatar.row) <= CARD.avatar.radius) return solidWithSpeckle(column, row);
		if (CARD.name.rows.includes(row) && between(column, CARD.name.left, CARD.name.right)) return DOT_FILLED;
		if (row === CARD.handle.row && between(column, CARD.handle.left, CARD.handle.right)) return DOT_HOLLOW;
		if (row === CARD.rule) return DOT_HOLLOW;
		const field = (row - CARD.fields.top) / CARD.fields.every;
		if (!Number.isInteger(field) || !between(field, 0, CARD.fields.value.ends.length - 1)) return DOT_ABSENT;
		if (between(column, CARD.fields.key.left, CARD.fields.key.right)) return DOT_HOLLOW;
		if (between(column, CARD.fields.value.left, CARD.fields.value.ends[field])) return field < filled ? DOT_FILLED : DOT_HOLLOW;
		return DOT_ABSENT;
	});
}

export const FIELD_COUNT = CARD.fields.value.ends.length;
export const PROFILE_EMPTY = pictureOfStates(paintProfile(blank(), 0));
export const PROFILE_FILLED = pictureOfStates(paintProfile(blank(), FIELD_COUNT));

const caption = (label: string, value: string, detail: string) => storyCaption(CONTEXT_STORY_GRID, 34, label, value, detail);
export const CAPTIONS = {
	company: caption('the company', 'about', 'description, industry, HQ'),
	socials: caption('where it is', 'socials', 'x, linkedin, github'),
	profile: caption('in your product', 'profile', 'every available field'),
};

/** The filled profile: what the picture shows before it plays, and instead of playing with reduced motion. */
export const CONTEXT_RESTING = { ...PROFILE_FILLED, texts: CAPTIONS.profile };
