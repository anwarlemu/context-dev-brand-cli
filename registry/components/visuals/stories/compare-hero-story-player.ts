import { BARS_FLAT, BARS_GROWN, COMPARE_CAPTIONS, FEATURES_CHECKED, FEATURES_UNCHECKED, FEATURE_COUNT, paintBars, paintFeatures } from '@/components/visuals/stories/compare-hero-story-scenes';
import { HERO_STORY_GRID, stepAt } from '@/components/visuals/stories/hero-story-kit';
import { captionedBeat } from '@/components/visuals/dot-engine/story-caption';
import { createBeatStoryPlayer } from '@/components/visuals/dot-engine/dot-story-beats';
import { clamp01, easeOut } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

/**
 * One comparison, played as a loop: the two tools are checked against each feature in turn, then the table melts
 * into pairs of bars that rise to show where each one comes out ahead.
 */

const CHECKING = { startsAt: 0.5, everySeconds: 0.45 };
const CHECKED_AT = CHECKING.startsAt + (FEATURE_COUNT - 1) * CHECKING.everySeconds;
const RISING = { startsAt: 0.3, seconds: 1.4 };

export function createCompareHeroStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: HERO_STORY_GRID,
		resting: { beat: 0, heldSeconds: CHECKED_AT + 0.8 },
		beats: [
			captionedBeat({
				picture: FEATURES_UNCHECKED,
				departure: FEATURES_CHECKED,
				caption: COMPARE_CAPTIONS.features,
				holdSeconds: CHECKED_AT + 1.8,
				isTyped: true,
				animate: (states, heldSeconds) => void paintFeatures(states, stepAt(heldSeconds, CHECKING, FEATURE_COUNT - 1) + 1),
			}),
			captionedBeat({
				picture: BARS_FLAT,
				departure: BARS_GROWN,
				caption: COMPARE_CAPTIONS.pricing,
				holdSeconds: RISING.startsAt + RISING.seconds + 1.8,
				isTyped: true,
				animate: (states, heldSeconds) => void paintBars(states, easeOut(clamp01((heldSeconds - RISING.startsAt) / RISING.seconds))),
			}),
		],
	});
}
