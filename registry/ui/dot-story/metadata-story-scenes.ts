import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf } from '@/components/ds/ui/dot-story-beats';
import { polygon, solidWithSpeckle, type DotPainter } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';
import { storyCaption } from '@/components/ds/ui/story-caption';

/**
 * The "Use available metadata" card's pictures, in the brand dot grid: a tag, for what a mapped URL can carry, and
 * three mapped URLs, two of which gain their title and description while the newest still waits for its own.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const METADATA_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, pitch: PITCH } = METADATA_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const TAG = { point: { column: 2, row: 19 }, shoulder: 12, right: 30, top: 8, bottom: 30, hole: { column: 10.5, row: 19, radius: 2.1 }, lines: [{ rows: [14, 15], to: 26 }, { rows: [19], to: 27 }, { rows: [22], to: 23 }, { rows: [25], to: 25 }], linesFrom: 16 };

// A luggage tag lying on its side, its point and string hole to the left, a title and lines of description on it.
const tag = polygon(
	[
		TAG.point,
		{ column: TAG.shoulder, row: TAG.top },
		{ column: TAG.right, row: TAG.top },
		{ column: TAG.right, row: TAG.bottom },
		{ column: TAG.shoulder, row: TAG.bottom },
	],
	(column, row) => {
		const fromHole = Math.hypot(column - TAG.hole.column, row - TAG.hole.row);
		if (fromHole <= TAG.hole.radius) return DOT_ABSENT;
		if (fromHole <= TAG.hole.radius + 1) return DOT_FILLED;
		const line = TAG.lines.find(({ rows }) => rows.includes(row));
		if (line && between(column, TAG.linesFrom, line.to)) return line.rows.length > 1 ? DOT_ABSENT : DOT_HOLLOW;
		return line?.rows.length === 1 ? DOT_FILLED : solidWithSpeckle(column, row);
	}
);

export const TAG_PICTURE = pictureOf(METADATA_STORY_GRID, tag);
export const TAG_CAPTION = storyCaption(METADATA_STORY_GRID, 34, 'each URL can carry', 'a title', 'and a description');

const CARD = { left: 3, right: 54, rows: 10, tops: [2, 14, 26], tab: 5, body: { left: 12, right: 51, top: 5, bottom: 7 } };
const PAGES = [
	{ url: 'stripe.com/pricing', title: 'Pricing & fees', description: 'Pay-as-you-go pricing for payments' },
	{ url: 'stripe.com/docs/api', title: 'API reference', description: 'Complete reference for the Stripe API' },
	{ url: 'stripe.com/sessions/2026', title: '', description: '' },
];
/** The pages whose title and description are available; the newest has been found but not yet enriched. */
export const ENRICHED_COUNT = PAGES.filter(({ title }) => title.length > 0).length;
export const cardAt = (row: number) => CARD.tops.findIndex((top) => between(row, top, top + CARD.rows - 1));
/** How far along a card's metadata a dot is, from 0 to 1, or -1 if it is not part of it. */
export const alongMetadata = (column: number, row: number) => {
	const card = cardAt(row);
	if (card < 0 || !between(row - CARD.tops[card], CARD.body.top, CARD.body.bottom) || !between(column, CARD.body.left, CARD.body.right)) return -1;
	return (column - CARD.body.left) / (CARD.body.right - CARD.body.left);
};

// Each mapped URL is a card with a solid tab. Its URL is written along the top; below it, a block of rings stands
// in for the title and description until they arrive, and clears to make room for them when they do.
const cards = (isEnriched: (card: number) => boolean): DotPainter => (column, row) => {
	const card = cardAt(row);
	if (card < 0 || !between(column, CARD.left, CARD.right)) return DOT_ABSENT;
	const down = row - CARD.tops[card];
	if (column <= CARD.left + CARD.tab) return between(down, 4, 5) && between(column, CARD.left + 2, CARD.left + 3) ? DOT_HOLLOW : DOT_FILLED;
	if (column === CARD.right || down === 0 || down === CARD.rows - 1) return DOT_FILLED;
	if (alongMetadata(column, row) < 0) return DOT_ABSENT;
	return isEnriched(card) ? DOT_ABSENT : DOT_HOLLOW;
};

export const CARDS_FOUND = pictureOf(METADATA_STORY_GRID, cards(() => false));
export const CARDS_ENRICHED = pictureOf(METADATA_STORY_GRID, cards((card) => card < ENRICHED_COUNT));

/** Clears each card's block of rings `enriched[card]` of the way along, from its left. */
export function paintEnriched(states: Uint8Array, enriched: number[]) {
	for (let cell = 0; cell < states.length; cell++) {
		const row = Math.floor(cell / COLUMNS);
		const along = alongMetadata(cell % COLUMNS, row);
		if (along >= 0 && along <= (enriched[cardAt(row)] ?? 0)) states[cell] = CARDS_ENRICHED.states[cell];
	}
	return states;
}

const TEXT_LEFT = x(CARD.body.left);
export const CARD_TEXTS = PAGES.map(({ url, title, description }, index) => ({
	url: { text: url, x: TEXT_LEFT, y: baselineOn(CARD.tops[index] + 2.5, 13), size: 13, weight: 700, muted: true } satisfies DotStoryText,
	status: { text: 'pending', x: x(CARD.right - 1.5), y: baselineOn(CARD.tops[index] + 2.5, 12), size: 12, weight: 700, muted: true, anchor: 'end' } satisfies DotStoryText,
	title: { text: title, x: TEXT_LEFT, y: baselineOn(CARD.tops[index] + 5, 16), size: 16, weight: 800 } satisfies DotStoryText,
	description: { text: description, x: TEXT_LEFT, y: baselineOn(CARD.tops[index] + 7.3, 12), size: 12, weight: 700, muted: true } satisfies DotStoryText,
}));
export const enrichedStatus = (status: DotStoryText): DotStoryText => ({ ...status, text: 'enriched', muted: false });

/** The URLs, as enriched as they get: what the picture shows before it plays, and instead of playing with reduced motion. */
export const METADATA_RESTING = {
	...CARDS_ENRICHED,
	texts: CARD_TEXTS.flatMap(({ url, status, title, description }, index) => (index < ENRICHED_COUNT ? [url, enrichedStatus(status), title, description] : [url, status])),
};
