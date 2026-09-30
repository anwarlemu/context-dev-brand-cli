import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, distanceToSegment, isFilledAmongSolids, paintShape, type DotShape } from '@/components/ds/ui/dot-story-cells';
import { storyCaption } from '@/components/ds/ui/story-caption';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Control freshness" card's pictures, in the brand dot grid: a dial that sets how old a copy may be, the cache
 * a copy that is fresh enough is served from, and the live web a fresh capture goes out to.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const FRESHNESS_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = FRESHNESS_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(FRESHNESS_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);

// Every picture stands in the same place, left of the words that say what it means.
const CENTRE = 16;

const DIAL = { centre: { column: CENTRE, row: 25 }, radius: 14.4, band: 4, needle: 9.5, needleWidth: 0.75, hub: 2.2, ticks: 6, tickGap: 0.09 };
const isDial: DotShape = (column, row) => row <= DIAL.centre.row && Math.hypot(column - DIAL.centre.column, row - DIAL.centre.row) <= DIAL.radius;

/**
 * The dial with its needle `age` of the way from fresh (far left) to the oldest copy (far right). The band fills
 * behind the needle: every age up to the one it points at is accepted.
 */
export function paintDial(states: Uint8Array, age: number) {
	const angle = Math.PI * (1 - age);
	const tip = { column: DIAL.centre.column + DIAL.needle * Math.cos(angle), row: DIAL.centre.row - DIAL.needle * Math.sin(angle) };
	states.fill(DOT_ABSENT);
	return paintShape(FRESHNESS_STORY_GRID, states, isDial, (column, row) => {
		const fromCentre = Math.hypot(column - DIAL.centre.column, row - DIAL.centre.row);
		const along = 1 - Math.atan2(DIAL.centre.row - row, column - DIAL.centre.column) / Math.PI;
		if (fromCentre > DIAL.radius - 1 - DIAL.band) {
			const mark = along * DIAL.ticks;
			if (Math.abs(mark - Math.round(mark)) < DIAL.tickGap && Math.round(mark) % DIAL.ticks !== 0) return DOT_ABSENT;
			return along <= age ? DOT_FILLED : DOT_HOLLOW;
		}
		if (fromCentre <= DIAL.hub || distanceToSegment(column, row, DIAL.centre, tip) < DIAL.needleWidth) return DOT_FILLED;
		return DOT_ABSENT;
	});
}

export const DIAL_LABELS: DotStoryText[] = [
	{ text: 'fresh', x: x(CENTRE - DIAL.radius), y: baselineOn(DIAL.centre.row + 2.5, 12), size: 12, weight: 700, muted: true },
	{ text: 'older', x: x(CENTRE + DIAL.radius + 1), y: baselineOn(DIAL.centre.row + 2.5, 12), size: 12, weight: 700, muted: true, anchor: 'end' },
];

const CACHE = { top: 8, bottom: 30, halfWidth: 11.4, depth: 3.2, seams: [15.3, 22.6], read: { rows: 2 } };
const isOnDisc = (column: number, row: number, discRow: number) => ((column - CENTRE) / CACHE.halfWidth) ** 2 + ((row - discRow) / CACHE.depth) ** 2 <= 1;
// The front edge of a disc whose middle is on `discRow`, one dot deep in each column.
const isOnRim = (column: number, row: number, discRow: number) => row === Math.round(discRow + CACHE.depth * Math.sqrt(Math.max(0, 1 - ((column - CENTRE) / CACHE.halfWidth) ** 2)));
const isCache: DotShape = (column, row) => (row >= CACHE.top && row <= CACHE.bottom && Math.abs(column - CENTRE) <= CACHE.halfWidth) || isOnDisc(column, row, CACHE.top) || isOnDisc(column, row, CACHE.bottom);

/** The cache, a drum of three stacked discs, with a band of rings `read` of the way down it as a copy is read out (none at 0 or 1). */
export function paintCache(states: Uint8Array, read: number) {
	const readRow = CACHE.top + CACHE.depth + read * (CACHE.bottom - CACHE.top);
	states.fill(DOT_ABSENT);
	return paintShape(FRESHNESS_STORY_GRID, states, isCache, (column, row) => {
		if (isOnRim(column, row, CACHE.top)) return DOT_FILLED;
		if (isOnDisc(column, row, CACHE.top)) return DOT_HOLLOW;
		if (CACHE.seams.some((seam) => isOnRim(column, row, seam))) return DOT_ABSENT;
		const isBeingRead = read > 0 && read < 1 && Math.abs(row - readRow) < CACHE.read.rows;
		return !isBeingRead && isFilledAmongSolids(column, row) ? DOT_FILLED : DOT_HOLLOW;
	});
}

const GLOBE = { centre: { column: CENTRE, row: 19 }, radius: 14.4, meridians: 6, lineWidth: 0.55, parallels: [-0.5, 0, 0.5] };
const isGlobe: DotShape = (column, row) => Math.hypot(column - GLOBE.centre.column, row - GLOBE.centre.row) <= GLOBE.radius;
/** How far the globe turns before it looks the same again: one meridian's width. */
export const GLOBE_TURN = Math.PI / GLOBE.meridians;

/** The live web, a globe turned `turned` radians: its meridians travel across its face, its parallels stay put. */
export function paintGlobe(states: Uint8Array, turned: number) {
	states.fill(DOT_ABSENT);
	return paintShape(FRESHNESS_STORY_GRID, states, isGlobe, (column, row) => {
		const up = (row - GLOBE.centre.row) / GLOBE.radius;
		if (GLOBE.parallels.some((parallel) => Math.abs(row - GLOBE.centre.row - parallel * GLOBE.radius) < GLOBE.lineWidth)) return DOT_FILLED;
		const across = (column - GLOBE.centre.column) / (GLOBE.radius * Math.sqrt(1 - up * up));
		const longitude = Math.asin(Math.max(-1, Math.min(1, across))) + turned;
		const fromMeridian = Math.abs(longitude / GLOBE_TURN - Math.round(longitude / GLOBE_TURN)) * GLOBE_TURN;
		// A meridian is one dot wide wherever it is on the face, so its width in longitude grows towards the limb.
		const dotInLongitude = 1 / (GLOBE.radius * Math.sqrt(1 - up * up) * Math.sqrt(Math.max(0.02, 1 - across * across)));
		return fromMeridian < GLOBE.lineWidth * dotInLongitude ? DOT_FILLED : DOT_HOLLOW;
	});
}

/** The oldest copy the first request accepts, as a share of the dial. */
export const CACHED_AGE = 0.7;
export const DIAL_FRESH = pictureOfStates(paintDial(blank(), 0));
export const DIAL_CACHED = pictureOfStates(paintDial(blank(), CACHED_AGE));
export const CACHE_AT_REST = pictureOfStates(paintCache(blank(), 0));
export const GLOBE_AT_REST = pictureOfStates(paintGlobe(blank(), 0));

export const ONE_HOUR_MS = 3_600_000;
export const CAPTIONS = {
	acceptCached: storyCaption(FRESHNESS_STORY_GRID, 34, 'maxAgeMs', String(ONE_HOUR_MS), 'a copy up to 1h old is fine'),
	cached: storyCaption(FRESHNESS_STORY_GRID, 34, 'from the cache', '40 ms', 'captured 12 minutes ago'),
	requireFresh: storyCaption(FRESHNESS_STORY_GRID, 34, 'maxAgeMs', '0', 'always captured fresh'),
	fresh: storyCaption(FRESHNESS_STORY_GRID, 34, 'from the live page', '1.9 s', 'captured just now'),
};

/** The live capture: what the picture shows before it plays, and instead of playing with reduced motion. */
export const FRESHNESS_RESTING = { ...GLOBE_AT_REST, texts: CAPTIONS.fresh };
