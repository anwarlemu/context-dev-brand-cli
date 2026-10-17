import { HERO_STORY_GRID, between, blankScreen, heroCaption, pictureOfStates } from '@/components/visuals/stories/hero-story-kit';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/visuals/dot-engine/dot-morph-dots';
import { pictureOf } from '@/components/visuals/dot-engine/dot-story-beats';
import { paintShape, polygon, rectangle, roundedBox, solid, solidWithSpeckle, stack, type DotBox, type DotPainter } from '@/components/visuals/dot-engine/dot-story-cells';

/** The blog hero's pictures, in the brand dot grid: a post being written, and a megaphone calling out the news. */

const SHEET: DotBox = { left: 6, right: 26, top: 3, bottom: 34 };
const TEXT_LEFT = 9;
const HEADLINE = { rows: [7, 8], right: 20 };
const LINES = [
	{ row: 12, right: 23 },
	{ row: 15, right: 21 },
	{ row: 18, right: 23 },
	{ row: 21, right: 17 },
	{ row: 25, right: 22 },
	{ row: 28, right: 23 },
	{ row: 31, right: 15 },
];
export const LINE_COUNT = LINES.length;

/** The post with `written` lines of its body set; the line being written is as long as its share. */
export function paintPost(states: Uint8Array, written: number) {
	return paintShape(HERO_STORY_GRID, states, roundedBox(SHEET, 2), (column, row) => {
		if (HEADLINE.rows.includes(row)) return between(column, TEXT_LEFT, HEADLINE.right) ? DOT_FILLED : DOT_ABSENT;
		const line = LINES.findIndex((candidate) => candidate.row === row);
		if (line === -1 || line >= written) return DOT_ABSENT;
		const right = TEXT_LEFT + (LINES[line].right - TEXT_LEFT) * Math.min(1, written - line);
		return between(column, TEXT_LEFT, right) ? DOT_HOLLOW : DOT_ABSENT;
	});
}

export const POST_UNWRITTEN = pictureOfStates(paintPost(blankScreen(), 0));
export const POST_WRITTEN = pictureOfStates(paintPost(blankScreen(), LINE_COUNT));

const HORN = polygon(
	[
		{ column: 7, row: 16 },
		{ column: 21, row: 8 },
		{ column: 21, row: 30 },
		{ column: 7, row: 22 },
	],
	solidWithSpeckle
);
const HANDLE = rectangle({ left: 9, right: 12, top: 23, bottom: 29 }, solid);
const CALL = { mouth: { column: 21, row: 19 }, radii: [4.5, 8.5], spread: 0.8, width: 0.55 };

const soundWaves =
	(count: number): DotPainter =>
	(column, row) => {
		const across = column - CALL.mouth.column;
		const down = row - CALL.mouth.row;
		if (across <= 0 || Math.abs(Math.atan2(down, across)) > CALL.spread) return DOT_ABSENT;
		return CALL.radii.slice(0, count).some((radius) => Math.abs(Math.hypot(across, down) - radius) < CALL.width) ? DOT_FILLED : DOT_ABSENT;
	};

/** The megaphone with none, one and both of its sound waves out. */
export const MEGAPHONE = [0, 1, 2].map((waves) => pictureOf(HERO_STORY_GRID, stack(HORN, HANDLE, soundWaves(waves))));

export const BLOG_CAPTIONS = {
	guides: heroCaption('from the team', 'guides', 'scraping, crawling, agents'),
	news: heroCaption('from the team', 'news', 'launches and updates'),
};

/** The written post: what the picture shows before it plays, and instead of playing with reduced motion. */
export const BLOG_RESTING = { ...POST_WRITTEN, texts: BLOG_CAPTIONS.guides };
