import { CREDITS_AWARDED, CREDITS_UNAWARDED, CREDIT_CAPTIONS, CURVE_CAPTION, CURVE_DRAWN, CURVE_END, CURVE_START, CURVE_UNDRAWN, TRANCHE_COUNT, paintCredits, paintCurve } from '@/components/visuals/stories/grants-hero-story-scenes';
import { HERO_STORY_GRID, stepAt } from '@/components/visuals/stories/hero-story-kit';
import { captionedBeat } from '@/components/visuals/dot-engine/story-caption';
import { createBeatStoryPlayer } from '@/components/visuals/dot-engine/dot-story-beats';
import { clamp01 } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

/**
 * One grant, played as a loop: an experiment's reward curve is drawn across its chart, then melts into the award's
 * usage credits, stacked up a tranche at a time as the total climbs.
 */

const DRAWING = { startsAt: 0.4, seconds: 2.2 };
const AWARDING = { startsAt: 0.5, everySeconds: 1.2, textSeconds: 0.25 };
const AWARDED_AT = AWARDING.startsAt + (TRANCHE_COUNT - 1) * AWARDING.everySeconds;

const awardedAt = (heldSeconds: number) => stepAt(heldSeconds, AWARDING, TRANCHE_COUNT - 1);

export function createGrantsHeroStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: HERO_STORY_GRID,
		resting: { beat: 1, heldSeconds: AWARDED_AT + 0.8 },
		beats: [
			captionedBeat({
				picture: CURVE_UNDRAWN,
				departure: CURVE_DRAWN,
				caption: CURVE_CAPTION,
				holdSeconds: DRAWING.startsAt + DRAWING.seconds + 1.4,
				isTyped: true,
				animate: (states, heldSeconds) => void paintCurve(states, CURVE_START + Math.round((CURVE_END - CURVE_START) * clamp01((heldSeconds - DRAWING.startsAt) / DRAWING.seconds))),
			}),
			{
				...captionedBeat({ picture: CREDITS_UNAWARDED, departure: CREDITS_AWARDED, caption: CREDIT_CAPTIONS[0], holdSeconds: AWARDED_AT + 2.2, animate: (states, heldSeconds) => void paintCredits(states, awardedAt(heldSeconds) + 1) }),
				write(pen, heldSeconds) {
					const awarded = awardedAt(heldSeconds);
					if (awarded < 0) return;
					const written = clamp01((heldSeconds - AWARDING.startsAt - awarded * AWARDING.everySeconds) / AWARDING.textSeconds);
					CREDIT_CAPTIONS[awarded].forEach((text, line) => pen.text(text, line === 0 ? 1 : written));
				},
			},
		],
	});
}
