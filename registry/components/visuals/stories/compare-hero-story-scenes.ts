import { HERO_STORY_GRID, blankScreen, cellAt, heroCaption, pictureOfStates } from '@/components/visuals/stories/hero-story-kit';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/visuals/dot-engine/dot-morph-dots';
import { paintShape, rings, roundedBox, solid, type DotBox } from '@/components/visuals/dot-engine/dot-story-cells';

/**
 * The compare hero's pictures, in the brand dot grid: two tools checked against a list of features, and the same two
 * as pairs of bars. Context.dev is the solid one of each pair, the other tool the one in rings.
 */

const OURS: DotBox = { left: 13, right: 19, top: 4, bottom: 7 };
const THEIRS: DotBox = { left: 23, right: 29, top: 4, bottom: 7 };
const FEATURE_LEFT = 3;
const FEATURES = [
	{ row: 12, right: 9, theyHaveIt: true },
	{ row: 17, right: 7, theyHaveIt: false },
	{ row: 22, right: 10, theyHaveIt: true },
	{ row: 27, right: 8, theyHaveIt: false },
	{ row: 32, right: 9, theyHaveIt: false },
];
export const FEATURE_COUNT = FEATURES.length;
const MARK_REACH = 1;

function paintMark(states: Uint8Array, center: number, row: number, state: number) {
	for (let down = -MARK_REACH; down <= MARK_REACH; down++) {
		for (let across = -MARK_REACH; across <= MARK_REACH; across++) states[cellAt(center + across, row + down)] = state;
	}
}

/** The feature table with its first `checked` rows filled in: a block where a tool has the feature, a dash where not. */
export function paintFeatures(states: Uint8Array, checked: number) {
	states.fill(DOT_ABSENT);
	paintShape(HERO_STORY_GRID, states, roundedBox(OURS, 1), solid);
	paintShape(HERO_STORY_GRID, states, roundedBox(THEIRS, 1), rings);
	const oursCenter = (OURS.left + OURS.right) / 2;
	const theirsCenter = (THEIRS.left + THEIRS.right) / 2;
	FEATURES.slice(0, checked).forEach(({ row, right, theyHaveIt }) => {
		for (let column = FEATURE_LEFT; column <= right; column++) states[cellAt(column, row)] = DOT_HOLLOW;
		paintMark(states, oursCenter, row, DOT_FILLED);
		if (theyHaveIt) paintMark(states, theirsCenter, row, DOT_HOLLOW);
		else for (let across = -MARK_REACH; across <= MARK_REACH; across++) states[cellAt(theirsCenter + across, row)] = DOT_HOLLOW;
	});
	return states;
}

export const FEATURES_UNCHECKED = pictureOfStates(paintFeatures(blankScreen(), 0));
export const FEATURES_CHECKED = pictureOfStates(paintFeatures(blankScreen(), FEATURE_COUNT));

const BASELINE = { row: 32, left: 4, right: 29 };
const BAR_WIDTH = 3;
// Each comparison is a pair of bars; neither tool is the taller one every time.
const COMPARISONS = [
	{ left: 6, ours: 13, theirs: 19 },
	{ left: 14, ours: 23, theirs: 14 },
	{ left: 22, ours: 17, theirs: 9 },
];

function paintBar(states: Uint8Array, left: number, height: number, state: number) {
	for (let up = 1; up <= height; up++) {
		for (let across = 0; across < BAR_WIDTH; across++) states[cellAt(left + across, BASELINE.row - up)] = state;
	}
}

/** The bars `grown` of the way to their full height, from 0 to 1. */
export function paintBars(states: Uint8Array, grown: number) {
	states.fill(DOT_ABSENT);
	for (let column = BASELINE.left; column <= BASELINE.right; column++) states[cellAt(column, BASELINE.row)] = DOT_FILLED;
	for (const { left, ours, theirs } of COMPARISONS) {
		paintBar(states, left, Math.round(ours * grown), DOT_FILLED);
		paintBar(states, left + BAR_WIDTH + 1, Math.round(theirs * grown), DOT_HOLLOW);
	}
	return states;
}

export const BARS_FLAT = pictureOfStates(paintBars(blankScreen(), 0));
export const BARS_GROWN = pictureOfStates(paintBars(blankScreen(), 1));

export const COMPARE_CAPTIONS = {
	features: heroCaption('side by side', 'features', 'what each tool covers'),
	pricing: heroCaption('side by side', 'pricing', 'and where each one wins'),
};

/** The finished feature table: what the picture shows before it plays, and instead of playing with reduced motion. */
export const COMPARE_RESTING = { ...FEATURES_CHECKED, texts: COMPARE_CAPTIONS.features };
