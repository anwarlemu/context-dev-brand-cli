import { HERO_STORY_GRID, between, blankScreen, heroCaption, pictureOfStates } from '@/components/visuals/stories/hero-story-kit';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/visuals/dot-engine/dot-morph-dots';
import { isInDotBox, paintShape, rings, roundedBox, solidWithSpeckle, type DotBox } from '@/components/visuals/dot-engine/dot-story-cells';

/** The free tools hero's pictures, in the brand dot grid: a shelf of tools, and one of them run on a URL. */

const TILE = { size: 6, left: 3, top: 6, everyColumn: 7, everyRow: 9, perRow: 4 };
export const TILE_COUNT = 12;
const tileBox = (index: number): DotBox => {
	const left = TILE.left + (index % TILE.perRow) * TILE.everyColumn;
	const top = TILE.top + Math.floor(index / TILE.perRow) * TILE.everyRow;
	return { left, right: left + TILE.size - 1, top, bottom: top + TILE.size - 1 };
};

/** The shelf with its first `lit` tools picked out: a lit tool is solid, the rest rings. */
export function paintShelf(states: Uint8Array, lit: number) {
	for (let index = 0; index < TILE_COUNT; index++) paintShape(HERO_STORY_GRID, states, roundedBox(tileBox(index), 1), index < lit ? solidWithSpeckle : rings);
	return states;
}

export const SHELF_UNLIT = pictureOfStates(paintShelf(blankScreen(), 0));
export const SHELF_LIT = pictureOfStates(paintShelf(blankScreen(), TILE_COUNT));

const FIELD: DotBox = { left: 3, right: 29, top: 5, bottom: 10 };
const URL = { rows: [7, 8], left: 6, right: 17 };
const BUTTON: DotBox = { left: 21, right: 27, top: 7, bottom: 8 };
const PANEL: DotBox = { left: 3, right: 29, top: 14, bottom: 33 };
const FINDING_KEY = { left: 6, right: 9 };
const FINDING_VALUE_LEFT = 11;
const FINDINGS = [
	{ row: 17, right: 24 },
	{ row: 20, right: 20 },
	{ row: 23, right: 26 },
	{ row: 26, right: 18 },
	{ row: 29, right: 23 },
];
export const FINDING_COUNT = FINDINGS.length;

/** The tool with a URL in its field and the first `found` lines of its results in. */
export function paintTool(states: Uint8Array, found: number) {
	paintShape(HERO_STORY_GRID, states, roundedBox(FIELD, 2), (column, row) => {
		if (isInDotBox(BUTTON, column, row)) return DOT_FILLED;
		return URL.rows.includes(row) && between(column, URL.left, URL.right) ? DOT_HOLLOW : DOT_ABSENT;
	});
	return paintShape(HERO_STORY_GRID, states, roundedBox(PANEL, 2), (column, row) => {
		const finding = FINDINGS.findIndex((candidate) => candidate.row === row);
		if (finding === -1 || finding >= found) return DOT_ABSENT;
		if (between(column, FINDING_KEY.left, FINDING_KEY.right)) return DOT_FILLED;
		return between(column, FINDING_VALUE_LEFT, FINDINGS[finding].right) ? DOT_HOLLOW : DOT_ABSENT;
	});
}

export const TOOL_WAITING = pictureOfStates(paintTool(blankScreen(), 0));
export const TOOL_DONE = pictureOfStates(paintTool(blankScreen(), FINDING_COUNT));

export const FREE_TOOLS_CAPTIONS = {
	shelf: heroCaption('pick a tool', 'free', 'no account for basic use'),
	tool: heroCaption('paste a URL', 'results', 'powered by the API'),
};

/** The tool with its results in: what the picture shows before it plays, and instead of playing with reduced motion. */
export const FREE_TOOLS_RESTING = { ...TOOL_DONE, texts: FREE_TOOLS_CAPTIONS.tool };
