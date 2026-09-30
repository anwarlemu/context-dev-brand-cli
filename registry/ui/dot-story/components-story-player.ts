import { BUTTON_ROUNDED, BUTTON_SQUARE, CAPTIONS, CARD_PICTURE, COMPONENTS_STORY_GRID, MOON_AT_REST, MOON_WITH_STARS, SITE_RADIUS, SITE_RADIUS_PX, STAR_COUNT, SUN_AT_REST, SUN_TURN, paintButton, paintMoon, paintSun } from '@/components/ds/ui/components-story-scenes';
import { captionedBeat } from '@/components/ds/ui/story-caption';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01, easeOut } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One site's components, played as a loop: a square button's corners round to the site's radius as it is read, and
 * it melts into a card; the card melts into the sun of the light theme, its rays turning, and the sun into the
 * crescent of the dark one, its stars coming out.
 */

const ROUNDING = { startsAt: 0.5, seconds: 0.9 };
// The rays are back where they started as the sun melts away.
const SUN = { seconds: 3, turns: 2 };
const STARS = { startsAt: 0.6, everySeconds: 0.5 };

const roundedAt = (heldSeconds: number) => easeOut(clamp01((heldSeconds - ROUNDING.startsAt) / ROUNDING.seconds));

export function createComponentsStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const [radiusLabel, radius, radiusDetail] = CAPTIONS.button;
	return createBeatStoryPlayer(stage, {
		grid: COMPONENTS_STORY_GRID,
		resting: { beat: 1, heldSeconds: 1.5 },
		beats: [
			{
				...captionedBeat({ picture: BUTTON_SQUARE, departure: BUTTON_ROUNDED, caption: CAPTIONS.button, holdSeconds: ROUNDING.startsAt + ROUNDING.seconds + 1.4, animate: (states, heldSeconds) => void paintButton(states, roundedAt(heldSeconds) * SITE_RADIUS) }),
				write(pen, heldSeconds) {
					pen.text(radiusLabel);
					pen.text({ ...radius, text: `${Math.round(roundedAt(heldSeconds) * SITE_RADIUS_PX)}px` });
					pen.text(radiusDetail, clamp01((heldSeconds - ROUNDING.startsAt - ROUNDING.seconds) / 0.3));
				},
			},
			captionedBeat({ picture: CARD_PICTURE, caption: CAPTIONS.card, holdSeconds: 2.4, isTyped: true }),
			captionedBeat({ picture: SUN_AT_REST, caption: CAPTIONS.light, holdSeconds: SUN.seconds, isTyped: true, animate: (states, heldSeconds) => void paintSun(states, (heldSeconds / SUN.seconds) * SUN.turns * SUN_TURN) }),
			captionedBeat({
				picture: MOON_AT_REST,
				departure: MOON_WITH_STARS,
				caption: CAPTIONS.dark,
				holdSeconds: 2.8,
				isTyped: true,
				animate: (states, heldSeconds) => void paintMoon(states, heldSeconds < STARS.startsAt ? 0 : Math.min(STAR_COUNT, Math.floor((heldSeconds - STARS.startsAt) / STARS.everySeconds) + 1)),
			}),
		],
	});
}
