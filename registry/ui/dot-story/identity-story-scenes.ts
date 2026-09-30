import { GLOBE_AT_REST } from '@/components/ds/ui/freshness-story-scenes';
import { storyCaption } from '@/components/ds/ui/story-caption';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, distanceToSegment, paintShape, solidWithSpeckle, type DotShape, type GridPoint } from '@/components/ds/ui/dot-story-cells';

/**
 * The "Resolve an identity" card's pictures, in the brand dot grid: the four things a brand can be looked up by, a
 * domain's globe, an email's envelope, a name badge and a ticker's chart, and the seal that says which brand it is.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const IDENTITY_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = IDENTITY_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(IDENTITY_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

// Every picture stands in the same place, left of the words that say what it is.
const CENTRE = 16;
const LINE_WIDTH = 0.6;

export const DOMAIN_GLOBE = GLOBE_AT_REST;

const ENVELOPE = { left: 3, right: 29, top: 8, bottom: 29, flapTo: { column: CENTRE, row: 20 } };
const isEnvelope: DotShape = (column, row) => between(column, ENVELOPE.left, ENVELOPE.right) && between(row, ENVELOPE.top, ENVELOPE.bottom);
// How far down the flap's edge is in this column: it runs from each top corner to a point in the middle.
const flapEdge = (column: number) => ENVELOPE.top + ((ENVELOPE.flapTo.row - ENVELOPE.top) * Math.min(column - ENVELOPE.left, ENVELOPE.right - column)) / (CENTRE - ENVELOPE.left);

export const ENVELOPE_PICTURE = pictureOfStates(
	paintShape(IDENTITY_STORY_GRID, blank(), isEnvelope, (column, row) => {
		const belowFlap = row - flapEdge(column);
		if (Math.abs(belowFlap) < 0.8) return DOT_FILLED;
		return belowFlap < 0 ? solidWithSpeckle(column, row) : DOT_HOLLOW;
	})
);

const BADGE = { left: 4, right: 28, top: 7, bottom: 31, clip: { left: 13, right: 19, top: 3 }, header: 13, name: { top: 18, bottom: 21, left: 8, right: 24 }, line: { row: 25, left: 10, right: 22 } };
const isBadge: DotShape = (column, row) => (between(column, BADGE.left, BADGE.right) && between(row, BADGE.top, BADGE.bottom)) || (between(column, BADGE.clip.left, BADGE.clip.right) && between(row, BADGE.clip.top, BADGE.top));

// A name badge on its clip: a solid band across the top, the name in solid dots, a quieter line under it.
export const NAME_BADGE = pictureOfStates(
	paintShape(IDENTITY_STORY_GRID, blank(), isBadge, (column, row) => {
		if (row <= BADGE.header) return DOT_FILLED;
		if (between(row, BADGE.name.top, BADGE.name.bottom) && between(column, BADGE.name.left, BADGE.name.right)) return DOT_FILLED;
		if (row === BADGE.line.row && between(column, BADGE.line.left, BADGE.line.right)) return DOT_ABSENT;
		return DOT_HOLLOW;
	})
);

const CHART = { left: 4, right: 29, top: 5, bottom: 31, lineWidth: 1 };
const PRICES: GridPoint[] = [
	{ column: 5, row: 27 },
	{ column: 10, row: 21 },
	{ column: 14, row: 24 },
	{ column: 20, row: 14 },
	{ column: 24, row: 17 },
	{ column: 29, row: 7 },
];
const fromPriceLine = (column: number, row: number) => Math.min(...PRICES.slice(1).map((point, index) => distanceToSegment(column, row, PRICES[index], point)));
const priceAt = (column: number) => {
	const to = Math.max(1, PRICES.findIndex((point) => point.column >= column));
	const from = PRICES[to - 1];
	return from.row + ((PRICES[to].row - from.row) * (column - from.column)) / (PRICES[to].column - from.column);
};

/** A ticker's chart with `drawn` of its price line in, from the left: two axes, the line, and rings filling under it. */
export function paintChart(states: Uint8Array, drawn: number) {
	const drawnTo = CHART.left + drawn * (CHART.right - CHART.left);
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS / 2 + 2; column++) {
			const cell = row * COLUMNS + column;
			const isAxis = (column === CHART.left && between(row, CHART.top, CHART.bottom)) || (row === CHART.bottom && between(column, CHART.left, CHART.right));
			if (isAxis) states[cell] = DOT_FILLED;
			else if (column <= CHART.left || column > Math.min(drawnTo, CHART.right) || row >= CHART.bottom) states[cell] = DOT_ABSENT;
			else if (fromPriceLine(column, row) < CHART.lineWidth) states[cell] = DOT_FILLED;
			else states[cell] = row > priceAt(column) ? DOT_HOLLOW : DOT_ABSENT;
		}
	}
	return states;
}

/** How much of the price line is already in when the chart arrives; an axis alone has too little in it to melt into. */
export const CHART_ARRIVES_DRAWN = 0.35;
export const CHART_STARTED = pictureOfStates(paintChart(blank(), CHART_ARRIVES_DRAWN));
export const CHART_DRAWN = pictureOfStates(paintChart(blank(), 1));

const SEAL = { centre: { column: CENTRE, row: 19 }, radius: 12, scallop: 1.4, scallops: 8, tick: { from: { column: 10, row: 19.5 }, corner: { column: 14.5, row: 24 }, to: { column: 22.5, row: 14 }, width: 1.3 } };
const isSeal: DotShape = (column, row) => {
	const across = column - SEAL.centre.column;
	const down = row - SEAL.centre.row;
	return Math.hypot(across, down) <= SEAL.radius + SEAL.scallop * Math.cos(SEAL.scallops * Math.atan2(down, across));
};
const isTick = (column: number, row: number) => Math.min(distanceToSegment(column, row, SEAL.tick.from, SEAL.tick.corner), distanceToSegment(column, row, SEAL.tick.corner, SEAL.tick.to)) < SEAL.tick.width;

/** The seal, with `ticked` of its tick cut out of it in rings, from the tick's short stroke to the end of its long one. */
export function paintSeal(states: Uint8Array, ticked: number) {
	const tickedTo = SEAL.tick.from.column - 2 + ticked * (SEAL.tick.to.column + 4 - SEAL.tick.from.column);
	return paintShape(IDENTITY_STORY_GRID, states, isSeal, (column, row) => {
		if (isTick(column, row) && column <= tickedTo) return DOT_HOLLOW;
		return DOT_FILLED;
	});
}

export const SEAL_UNTICKED = pictureOfStates(paintSeal(blank(), 0));
export const SEAL_TICKED = pictureOfStates(paintSeal(blank(), 1));

const caption = (label: string, value: string, detail: string) => storyCaption(IDENTITY_STORY_GRID, 34, label, value, detail);
export const CAPTIONS = {
	domain: caption('look up by', 'domain', 'shopify.com'),
	email: caption('or by', 'email', 'ana@shopify.com'),
	name: caption('or by', 'name', '"Shopify"'),
	ticker: caption('or by', 'ticker', 'SHOP'),
	brand: caption('all four resolve to', 'Shopify', 'one brand profile'),
};

/** The resolved brand: what the picture shows before it plays, and instead of playing with reduced motion. */
export const IDENTITY_RESTING = { ...SEAL_TICKED, texts: CAPTIONS.brand };
