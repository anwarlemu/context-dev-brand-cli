import { HERO_STORY_GRID, blankScreen, cellAt, heroCaption, pictureOfStates } from '@/components/visuals/stories/hero-story-kit';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/visuals/dot-engine/dot-morph-dots';
import { paintShape, rings, roundedBox, solidWithSpeckle, type DotBox } from '@/components/visuals/dot-engine/dot-story-cells';

/**
 * The research grants hero's pictures, in the brand dot grid: an experiment's reward curve climbing over its
 * episodes, and the grant's usage credits as a stack awarded a tranche at a time.
 */

const AXES = { left: 5, right: 29, top: 6, bottom: 31 };
const CURVE = { firstColumn: AXES.left + 2, climb: 21, settlesOver: 7, thickness: 2 };
const EPISODE_EVERY = 3;
/** The last column the curve reaches. */
export const CURVE_END = AXES.right;

const rewardRow = (column: number) => AXES.bottom - 3 - Math.round(CURVE.climb * (1 - Math.exp(-(column - CURVE.firstColumn) / CURVE.settlesOver)));
// Single episodes land a little above or below the curve they average out to.
const episodeScatter = (column: number) => ((column * 7) % 5) - 2;

/** The chart with its curve drawn as far as column `reached`, and the episodes behind it as rings. */
export function paintCurve(states: Uint8Array, reached: number) {
	states.fill(DOT_ABSENT);
	for (let row = AXES.top; row <= AXES.bottom; row++) states[cellAt(AXES.left, row)] = DOT_FILLED;
	for (let column = AXES.left; column <= AXES.right; column++) states[cellAt(column, AXES.bottom)] = DOT_FILLED;
	for (let column = CURVE.firstColumn; column <= Math.min(reached, CURVE_END); column++) {
		const scatter = episodeScatter(column);
		if (column % EPISODE_EVERY === 0 && scatter !== 0) states[cellAt(column, rewardRow(column) + scatter * 2)] = DOT_HOLLOW;
		for (let down = 0; down < CURVE.thickness; down++) states[cellAt(column, rewardRow(column) + down)] = DOT_FILLED;
	}
	return states;
}

export const CURVE_START = CURVE.firstColumn - 1;
export const CURVE_UNDRAWN = pictureOfStates(paintCurve(blankScreen(), CURVE_START));
export const CURVE_DRAWN = pictureOfStates(paintCurve(blankScreen(), CURVE_END));

const STACK = { left: 8, right: 24 };
/** Each tranche of an award, the total it brings the credits to, and when it is added. */
const TRANCHES = [
	{ top: 26, bottom: 32, total: '$5,000', when: 'on acceptance' },
	{ top: 18, bottom: 24, total: '$10,000', when: 'after a progress review' },
	{ top: 4, bottom: 16, total: '$20,000', when: 'after a research milestone' },
];
export const TRANCHE_COUNT = TRANCHES.length;
const trancheBox = ({ top, bottom }: (typeof TRANCHES)[number]): DotBox => ({ ...STACK, top, bottom });

/** The stack with its first `awarded` tranches solid, and those still to come as rings. */
export function paintCredits(states: Uint8Array, awarded: number) {
	TRANCHES.forEach((tranche, index) => paintShape(HERO_STORY_GRID, states, roundedBox(trancheBox(tranche), 2), index < awarded ? solidWithSpeckle : rings));
	return states;
}

export const CREDITS_UNAWARDED = pictureOfStates(paintCredits(blankScreen(), 0));
export const CREDITS_AWARDED = pictureOfStates(paintCredits(blankScreen(), TRANCHE_COUNT));

export const CURVE_CAPTION = heroCaption('RL experiments', 'web data', 'search, scrape, company data');
export const CREDIT_CAPTIONS = TRANCHES.map(({ total, when }) => heroCaption('usage credits', total, when));

/** The full award: what the picture shows before it plays, and instead of playing with reduced motion. */
export const GRANTS_RESTING = { ...CREDITS_AWARDED, texts: CREDIT_CAPTIONS[TRANCHE_COUNT - 1] };
