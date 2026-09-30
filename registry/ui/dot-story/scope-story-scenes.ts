import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, distanceToSegment, isFilledAmongSolids, paintShape, type DotShape } from '@/components/ds/ui/dot-story-cells';
import { storyCaption } from '@/components/ds/ui/story-caption';

/**
 * The "Scope the discovery" card's pictures, in the brand dot grid: a domain with its subdomains around it, taken
 * in one by one, and a meter of links that fills to the limit set for the request and stops.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const SCOPE_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = SCOPE_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(SCOPE_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const DOMAIN = { centre: { column: 16, row: 17 }, radius: 6.2 };
const SUBDOMAIN = { radius: 3.6, out: 12 };
// The subdomains stand around the domain: upper left, upper right and straight below.
const SUBDOMAINS = [-5 / 6, -1 / 6, 1 / 2].map((turnsOfPi) => ({ column: DOMAIN.centre.column + SUBDOMAIN.out * Math.cos(turnsOfPi * Math.PI), row: DOMAIN.centre.row + SUBDOMAIN.out * Math.sin(turnsOfPi * Math.PI) }));
const isDomain: DotShape = (column, row) => Math.hypot(column - DOMAIN.centre.column, row - DOMAIN.centre.row) <= DOMAIN.radius;
const subdomainAt = (column: number, row: number) => SUBDOMAINS.findIndex((subdomain) => Math.hypot(column - subdomain.column, row - subdomain.row) <= SUBDOMAIN.radius);
const isSubdomain: DotShape = (column, row) => subdomainAt(column, row) >= 0;
const SPOKE_WIDTH = 0.6;

/** The domain and its subdomains, the first `included` of them taken in: an included one is solid, and so is its spoke. */
export function paintDomains(states: Uint8Array, included: number) {
	states.fill(DOT_ABSENT);
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS / 2; column++) {
			const spoke = SUBDOMAINS.findIndex((subdomain) => distanceToSegment(column, row, DOMAIN.centre, subdomain) < SPOKE_WIDTH);
			if (spoke >= 0) states[row * COLUMNS + column] = spoke < included ? DOT_FILLED : DOT_HOLLOW;
		}
	}
	paintShape(SCOPE_STORY_GRID, states, isSubdomain, (column, row) => (subdomainAt(column, row) < included && isFilledAmongSolids(column, row) ? DOT_FILLED : DOT_HOLLOW));
	return paintShape(SCOPE_STORY_GRID, states, isDomain, (column, row) => (isFilledAmongSolids(column, row) ? DOT_FILLED : DOT_HOLLOW));
}

export const SUBDOMAIN_COUNT = SUBDOMAINS.length;
export const DOMAIN_ALONE = pictureOfStates(paintDomains(blank(), 0));
export const DOMAIN_WITH_SUBDOMAINS = pictureOfStates(paintDomains(blank(), SUBDOMAIN_COUNT));

const METER = { left: 8, right: 22, top: 3, bottom: 34, link: { left: 10, right: 20, from: 32, every: 2 }, slots: 14, limit: 9, marker: { column: 24, reach: 3 } };
const isMeter: DotShape = (column, row) => between(column, METER.left, METER.right) && between(row, METER.top, METER.bottom);
const slotRow = (slot: number) => METER.link.from - slot * METER.link.every;
const LIMIT_ROW = slotRow(METER.limit) + 1;

/** The meter with `links` of its slots filled from the bottom; the marker beside it points at the limit. */
export function paintMeter(states: Uint8Array, links: number) {
	states.fill(DOT_ABSENT);
	paintShape(SCOPE_STORY_GRID, states, isMeter, (column, row) => {
		if (row === LIMIT_ROW) return DOT_FILLED;
		const slot = (METER.link.from - row) / METER.link.every;
		if (!Number.isInteger(slot) || !between(slot, 0, METER.slots - 1) || !between(column, METER.link.left, METER.link.right)) return DOT_ABSENT;
		return slot < links ? DOT_FILLED : DOT_HOLLOW;
	});
	// An arrowhead pointing in at the limit line.
	for (let reach = 0; reach <= METER.marker.reach; reach++) {
		for (let row = LIMIT_ROW - reach; row <= LIMIT_ROW + reach; row++) states[row * COLUMNS + METER.marker.column + reach] = DOT_FILLED;
	}
	return states;
}

export const LINK_LIMIT_SLOTS = METER.limit;
export const METER_EMPTY = pictureOfStates(paintMeter(blank(), 0));
export const METER_AT_LIMIT = pictureOfStates(paintMeter(blank(), METER.limit));

export const MAX_LINKS = 500;
export const CAPTIONS = {
	subdomains: storyCaption(SCOPE_STORY_GRID, 34, 'includeSubdomains', 'true', 'docs. blog. and app. too'),
	limit: storyCaption(SCOPE_STORY_GRID, 34, 'maxLinks', String(MAX_LINKS), 'and the map stops there'),
};

/** The meter at its limit: what the picture shows before it plays, and instead of playing with reduced motion. */
export const SCOPE_RESTING = { ...METER_AT_LIMIT, texts: CAPTIONS.limit };
