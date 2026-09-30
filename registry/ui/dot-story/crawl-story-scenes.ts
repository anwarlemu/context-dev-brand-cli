import { storyCaption } from '@/components/ds/ui/story-caption';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, paintShape, roundedBox, type DotBox } from '@/components/ds/ui/dot-story-cells';

/**
 * The "Full-site collection" card's pictures, in the brand dot grid: the sitemap a crawl can start from, and the
 * crawl itself, a web spun outwards from the start one ring of links at a time, as far as its scope allows.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const CRAWL_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = CRAWL_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(CRAWL_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const SHEET: DotBox = { left: 6, right: 26, top: 3, bottom: 34 };
// The sitemap's entries: a section is a solid line, the pages under it indented lines of rings.
const ENTRIES = [
	{ row: 7, indent: 0, to: 16 },
	{ row: 10, indent: 3, to: 22 },
	{ row: 13, indent: 3, to: 19 },
	{ row: 17, indent: 0, to: 14 },
	{ row: 20, indent: 3, to: 23 },
	{ row: 23, indent: 3, to: 20 },
	{ row: 26, indent: 3, to: 22 },
	{ row: 30, indent: 0, to: 17 },
];
const ENTRY_LEFT = 9;

export const SITEMAP = pictureOfStates(
	paintShape(CRAWL_STORY_GRID, blank(), roundedBox(SHEET, 2), (column, row) => {
		const entry = ENTRIES.find((candidate) => candidate.row === row);
		if (!entry || !between(column, ENTRY_LEFT + entry.indent, entry.to)) return DOT_ABSENT;
		return entry.indent === 0 ? DOT_FILLED : DOT_HOLLOW;
	})
);

const WEB = { centre: { column: 16, row: 19 }, hub: 1.7, rings: [4.6, 9.2, 13.8], ringWidth: 0.55, spokes: 8, spokeWidth: 0.06 };
/** How many links deep the crawl can go: one ring of the web for each. */
export const MAX_DEPTH = WEB.rings.length;

/** The web spun `depth` rings out from the start: what the crawl has reached is solid, what is still out of reach rings. */
export function paintWeb(states: Uint8Array, depth: number) {
	const reached = depth > 0 ? WEB.rings[depth - 1] + WEB.ringWidth : WEB.hub;
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS / 2 + 3; column++) {
			const across = column - WEB.centre.column;
			const down = row - WEB.centre.row;
			const fromCentre = Math.hypot(across, down);
			const spoke = (Math.atan2(down, across) / (Math.PI * 2)) * WEB.spokes;
			const isOnSpoke = fromCentre <= WEB.rings[WEB.rings.length - 1] + WEB.ringWidth && Math.abs(spoke - Math.round(spoke)) * fromCentre < WEB.spokeWidth * WEB.spokes * 1.4;
			const isOnRing = WEB.rings.some((ring) => Math.abs(fromCentre - ring) < WEB.ringWidth);
			const cell = row * COLUMNS + column;
			if (fromCentre <= WEB.hub) states[cell] = DOT_FILLED;
			else if (isOnSpoke || isOnRing) states[cell] = fromCentre <= reached ? DOT_FILLED : DOT_HOLLOW;
			else states[cell] = DOT_ABSENT;
		}
	}
	return states;
}

export const WEB_UNSPUN = pictureOfStates(paintWeb(blank(), 0));
export const WEB_SPUN = pictureOfStates(paintWeb(blank(), MAX_DEPTH));

const caption = (label: string, value: string, detail: string) => storyCaption(CRAWL_STORY_GRID, 34, label, value, detail);
export const SITEMAP_CAPTION = caption('start from', 'sitemap', 'or any URL on the site');
export const DEPTH_CAPTIONS = Array.from({ length: MAX_DEPTH + 1 }, (_, depth) => caption('crawl depth', String(depth), depth === MAX_DEPTH ? 'the scope you set' : 'following links'));

/** The whole web: what the picture shows before it plays, and instead of playing with reduced motion. */
export const CRAWL_RESTING = { ...WEB_SPUN, texts: DEPTH_CAPTIONS[MAX_DEPTH] };
