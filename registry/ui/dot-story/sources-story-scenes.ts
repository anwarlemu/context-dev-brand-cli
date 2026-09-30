import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, distanceToSegment, paintShape, paintedStates, solidWithSpeckle, type DotPainter, type DotShape, type GridPoint } from '@/components/ds/ui/dot-story-cells';
import { storyCaption } from '@/components/ds/ui/story-caption';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Keep the sources" card's pictures, in the brand dot grid: the answer as a written page, the link that every
 * claim in it keeps, and the page again with each claim tied to the numbered URL it came from.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const SOURCES_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = SOURCES_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(SOURCES_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const PAGE = { left: 2, right: 23, top: 3, bottom: 34, text: { left: 5, right: 20 }, title: { rows: [6, 7], to: 13 } };
// Three paragraphs of three lines; the middle line of each is the claim a source backs.
const CLAIM_ROWS = [13, 21, 29];
const LINE_ENDS = [20, 18, 15];

const isClaim = (column: number, row: number) => CLAIM_ROWS.includes(row) && between(column, PAGE.text.left, LINE_ENDS[1]);

const answerPage = (isCited: (claim: number) => boolean): DotPainter => (column, row) => {
	if (!between(column, PAGE.left, PAGE.right) || !between(row, PAGE.top, PAGE.bottom)) return DOT_ABSENT;
	if (column === PAGE.left || column === PAGE.right || row === PAGE.top || row === PAGE.bottom) return DOT_FILLED;
	if (PAGE.title.rows.includes(row)) return between(column, PAGE.text.left, PAGE.title.to) ? DOT_FILLED : DOT_ABSENT;
	const claim = CLAIM_ROWS.findIndex((claimRow) => Math.abs(row - claimRow) <= 2);
	if (claim < 0 || (row - CLAIM_ROWS[claim]) % 2 !== 0) return DOT_ABSENT;
	const line = (row - CLAIM_ROWS[claim]) / 2 + 1;
	if (!between(column, PAGE.text.left, LINE_ENDS[line])) return DOT_ABSENT;
	return line === 1 && isCited(claim) ? DOT_FILLED : DOT_HOLLOW;
};

export const ANSWER = pictureOfStates(paintedStates(SOURCES_STORY_GRID, answerPage(() => false)));

const LINK = { outer: 5.6, inner: 2.6, spines: [[{ column: 8.5, row: 25.5 }, { column: 14, row: 20 }], [{ column: 18, row: 16 }, { column: 23.5, row: 10.5 }]] satisfies GridPoint[][] };
const fromSpine = (column: number, row: number, [from, to]: GridPoint[]) => distanceToSegment(column, row, from, to);
// Two links of a chain, end over end on the diagonal.
const isChain: DotShape = (column, row) => LINK.spines.some((spine) => between(fromSpine(column, row, spine), LINK.inner, LINK.outer));

export const CHAIN = pictureOfStates(paintShape(SOURCES_STORY_GRID, blank(), isChain, solidWithSpeckle));

const BADGE = { left: 28, columns: 5, rows: 7 };
const CONNECTOR = { from: PAGE.right + 1, to: BADGE.left - 1 };
// Each source's number, cut out of its solid badge in rings: type set over the dots would only show between them.
const DIGITS = [
	[' o ', 'oo ', ' o ', ' o ', 'ooo'],
	['oo ', '  o', ' o ', 'o  ', 'ooo'],
	['oo ', '  o', ' o ', '  o', 'oo '],
];
const SOURCES = [
	{ url: 'linear.app/pricing', title: 'Pricing' },
	{ url: 'linear.app/docs/billing', title: 'Billing and plans' },
	{ url: 'linear.app/changelog', title: 'Changelog' },
];

const citations = (isCited: (claim: number) => boolean): DotPainter => (column, row) => {
	const claim = CLAIM_ROWS.findIndex((claimRow) => Math.abs(row - claimRow) <= (BADGE.rows - 1) / 2);
	if (claim < 0) return DOT_ABSENT;
	if (row === CLAIM_ROWS[claim] && between(column, CONNECTOR.from, CONNECTOR.to)) return isCited(claim) ? DOT_FILLED : DOT_HOLLOW;
	if (!between(column, BADGE.left, BADGE.left + BADGE.columns - 1)) return DOT_ABSENT;
	if (!isCited(claim)) return DOT_HOLLOW;
	const mark = DIGITS[claim][row - CLAIM_ROWS[claim] + 2]?.[column - BADGE.left - 1];
	return mark === 'o' ? DOT_HOLLOW : DOT_FILLED;
};

const citedAnswer = (isCited: (claim: number) => boolean) => paintedStates(SOURCES_STORY_GRID, (column, row) => (column <= PAGE.right ? answerPage(isCited)(column, row) : citations(isCited)(column, row)));

export const UNCITED = pictureOfStates(citedAnswer(() => false));
export const CITED = pictureOfStates(citedAnswer(() => true));

/** Ties the first `count` claims to their sources: the claim goes solid, and so do its connector and its badge. */
export function paintCited(states: Uint8Array, count: number) {
	for (let cell = 0; cell < states.length; cell++) {
		const row = Math.floor(cell / COLUMNS);
		const claim = CLAIM_ROWS.findIndex((claimRow) => Math.abs(row - claimRow) <= (BADGE.rows - 1) / 2);
		if (claim >= 0 && claim < count && (cell % COLUMNS >= CONNECTOR.from || isClaim(cell % COLUMNS, row))) states[cell] = CITED.states[cell];
	}
	return states;
}

const SOURCE_LEFT = x(BADGE.left + BADGE.columns + 1.5);
export const SOURCE_TEXTS: DotStoryText[][] = SOURCES.map(({ url, title }, index) => [
	{ text: url, x: SOURCE_LEFT, y: baselineOn(CLAIM_ROWS[index] - 1.2, 14), size: 14, weight: 800 },
	{ text: title, x: SOURCE_LEFT, y: baselineOn(CLAIM_ROWS[index] + 1.4, 12), size: 12, weight: 700, muted: true },
]);

export const CAPTIONS = {
	answer: storyCaption(SOURCES_STORY_GRID, 34, 'the answer', '3 claims', 'but where are they from?'),
	links: storyCaption(SOURCES_STORY_GRID, 34, 'it returns', '3 URLs', 'one for every claim'),
};
export const CLAIM_COUNT = CLAIM_ROWS.length;

/** The answer with its sources: what the picture shows before it plays, and instead of playing with reduced motion. */
export const SOURCES_RESTING = { ...CITED, texts: SOURCE_TEXTS.flat() };
