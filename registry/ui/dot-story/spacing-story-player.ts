import { DEPTH_CAPTIONS, DEPTH_HIGH, DEPTH_LOW, SHADOWS, SPACES, SPACING_CAPTIONS, SPACING_LOOSE, SPACING_STORY_GRID, SPACING_TIGHT, paintDepth, paintSpacing } from '@/components/ds/ui/spacing-story-scenes';
import { createBeatStoryPlayer, type StoryBeat, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage, DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * One site's spacing and depth, played as a loop: two blocks open to each step of the spacing scale, the measure
 * between them growing as its value is read; they melt into a card whose shadow throws further at each elevation.
 */

const MELT_SECONDS = 1.1;
const STEPPING = { startsAt: 0.7, everySeconds: 0.8, settleSeconds: 1.5 };

const stepAt = (heldSeconds: number, last: number) => (heldSeconds < STEPPING.startsAt ? 0 : Math.min(last, Math.floor((heldSeconds - STEPPING.startsAt) / STEPPING.everySeconds) + 1));
const steppedAt = (last: number) => STEPPING.startsAt + (last - 1) * STEPPING.everySeconds;

/** A beat that steps through a scale: the picture is repainted and its caption's value changes at each step. */
function scaleBeat(picture: StoryPicture, departure: StoryPicture, captions: DotStoryText[][], paint: (states: Uint8Array, step: number) => void): StoryBeat {
	const last = captions.length - 1;
	return {
		picture,
		departure,
		arrival: { kind: 'melts', seconds: MELT_SECONDS },
		holdSeconds: steppedAt(last) + STEPPING.settleSeconds,
		animate: (states, heldSeconds) => paint(states, stepAt(heldSeconds, last)),
		write: (pen, heldSeconds) => captions[stepAt(heldSeconds, last)].forEach((text) => pen.text(text)),
	};
}

export function createSpacingStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: SPACING_STORY_GRID,
		resting: { beat: 1, heldSeconds: steppedAt(SHADOWS.length - 1) + 0.8 },
		beats: [
			scaleBeat(SPACING_TIGHT, SPACING_LOOSE, SPACING_CAPTIONS, (states, step) => void paintSpacing(states, SPACES[step].rows)),
			scaleBeat(DEPTH_LOW, DEPTH_HIGH, DEPTH_CAPTIONS, (states, step) => void paintDepth(states, SHADOWS[step].offset)),
		],
	});
}
