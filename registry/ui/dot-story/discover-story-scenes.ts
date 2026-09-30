import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, paintShape, type DotPainter, type DotShape } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';
import { storyCaption } from '@/components/ds/ui/story-caption';

/**
 * The "Discover page URLs" card's pictures, in the brand dot grid: a radar that sweeps a domain and finds its pages
 * as blips, and the list of URLs the sweep brings back.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const DISCOVER_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = DISCOVER_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(DISCOVER_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;
const TURN = Math.PI * 2;

const RADAR = { centre: { column: 16, row: 19 }, radius: 14.4, ranges: [4.8, 9.6], rangeWidth: 0.5, hub: 1.2, beam: 0.09, wake: 0.16 };
// Each page the sweep finds, by where it is on the dial: how far round (in turns, from 12 o'clock) and how far out.
const BLIPS = [
	{ turns: 0.1, out: 7 },
	{ turns: 0.27, out: 11.5 },
	{ turns: 0.44, out: 5.5 },
	{ turns: 0.6, out: 11 },
	{ turns: 0.78, out: 7.5 },
	{ turns: 0.93, out: 12 },
].map(({ turns, out }) => ({ turns, column: Math.round(RADAR.centre.column + out * Math.sin(turns * TURN)), row: Math.round(RADAR.centre.row - out * Math.cos(turns * TURN)) }));
const isRadar: DotShape = (column, row) => Math.hypot(column - RADAR.centre.column, row - RADAR.centre.row) <= RADAR.radius;

/** The radar `swept` turns into its sweep: a solid beam with a wake behind it, and a blip for every page it has passed. */
export function paintRadar(states: Uint8Array, swept: number) {
	const beam = swept % 1;
	states.fill(DOT_ABSENT);
	return paintShape(DISCOVER_STORY_GRID, states, isRadar, (column, row) => {
		const across = column - RADAR.centre.column;
		const up = RADAR.centre.row - row;
		const fromCentre = Math.hypot(across, up);
		if (fromCentre <= RADAR.hub) return DOT_FILLED;
		const blip = BLIPS.find((candidate) => Math.max(Math.abs(column - candidate.column), Math.abs(row - candidate.row)) <= 1);
		if (blip && swept >= blip.turns) return column === blip.column && row === blip.row ? DOT_FILLED : DOT_ABSENT;
		const behindBeam = (((beam - Math.atan2(across, up) / TURN) % 1) + 1) % 1;
		if (swept > 0 && swept < SWEEPS && behindBeam < RADAR.wake) return behindBeam < RADAR.beam / Math.max(1, fromCentre / 4) ? DOT_FILLED : DOT_ABSENT;
		if (RADAR.ranges.some((range) => Math.abs(fromCentre - range) < RADAR.rangeWidth) || across === 0 || up === 0) return DOT_ABSENT;
		return DOT_HOLLOW;
	});
}

/** How many times the beam goes round; it stops where it started. */
export const SWEEPS = 2;
export const RADAR_AT_REST = pictureOfStates(paintRadar(blank(), 0));
export const RADAR_SWEPT = pictureOfStates(paintRadar(blank(), SWEEPS));

export const PAGES_FOUND = 214;
export const RADAR_CAPTION = storyCaption(DISCOVER_STORY_GRID, 34, 'stripe.com', String(PAGES_FOUND), 'page URLs discovered');

const LIST = { left: 3, right: 54, top: 2, rowHeight: 6, every: 7, tab: 5 };
const URLS = ['stripe.com/pricing', 'stripe.com/payments', 'stripe.com/docs/api', 'stripe.com/customers', 'stripe.com/blog/changelog'];
const rowTop = (index: number) => LIST.top + index * LIST.every;
export const listRowAt = (row: number) => Math.min(URLS.length - 1, Math.max(0, Math.floor((row - LIST.top) / LIST.every)));

// Each URL is a bar with a solid tab, a link's ring cut out of it. Full of rings the list has enough in it to melt;
// cleared, each bar has room for its URL.
const urlList = (isCleared: boolean): DotPainter => (column, row) => {
	const index = listRowAt(row);
	const down = row - rowTop(index);
	if (!between(column, LIST.left, LIST.right) || !between(down, 0, LIST.rowHeight - 1)) return DOT_ABSENT;
	if (column <= LIST.left + LIST.tab) return between(down, 2, 3) && between(column, LIST.left + 2, LIST.left + 3) ? DOT_HOLLOW : DOT_FILLED;
	if (column === LIST.right || down === 0 || down === LIST.rowHeight - 1) return DOT_FILLED;
	return isCleared ? DOT_ABSENT : DOT_HOLLOW;
};

export const LIST_FILLED = pictureOf(DISCOVER_STORY_GRID, urlList(false));
export const LIST_READ = pictureOf(DISCOVER_STORY_GRID, urlList(true));
/** How far through the reading a dot is reached: the URLs in order, each from its tab to its end. */
export const readingOrder = (column: number, row: number) => (listRowAt(row) + column / COLUMNS) / URLS.length;

export const URL_TEXTS: DotStoryText[] = URLS.map((url, index) => ({ text: url, x: x(LIST.left + LIST.tab + 3), y: baselineOn(rowTop(index) + 2.5, 16), size: 16, weight: 700 }));

/** The list of URLs: what the picture shows before it plays, and instead of playing with reduced motion. */
export const DISCOVER_RESTING = { ...LIST_READ, texts: URL_TEXTS };
