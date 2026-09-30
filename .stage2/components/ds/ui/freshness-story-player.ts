import { CACHED_AGE, CACHE_AT_REST, CAPTIONS, DIAL_CACHED, DIAL_FRESH, DIAL_LABELS, FRESHNESS_STORY_GRID, GLOBE_AT_REST, GLOBE_TURN, ONE_HOUR_MS, paintCache, paintDial, paintGlobe } from '@/components/ds/ui/freshness-story-scenes';
import { createBeatStoryPlayer, type StoryBeat, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage, DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * Two requests for the same page, played as a loop: the dial is turned up to accept an hour-old copy, and melts
 * into the cache that copy is read from; then it is turned back to zero, and melts into the live web the fresh
 * capture goes out to.
 */

const MELT_SECONDS = 1.1;
const TURN = { startsAt: 0.35, seconds: 1.2 };
const READ = { startsAt: 0.4, seconds: 0.9 };
const DETAIL = { fadeSeconds: 0.3 };
// The globe looks the same after each second of turning, so the picture the story rests on is one it really shows.
const GLOBE_TURNS_PER_SECOND = 1;
const MS_STEP = 1000;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

function captioned(picture: StoryPicture, holdSeconds: number, animate: NonNullable<StoryBeat['animate']>, [label, value, detail]: DotStoryText[], detailAt: number): StoryBeat {
	return {
		picture,
		arrival: { kind: 'melts', seconds: MELT_SECONDS },
		holdSeconds,
		animate,
		write(pen, heldSeconds) {
			pen.text(label);
			pen.text(value);
			pen.text(detail, clamp01((heldSeconds - detailAt) / DETAIL.fadeSeconds));
		},
	};
}

/** The dial turned from one age to another, its reading counting along with the needle. */
function dialBeat(picture: StoryPicture, departure: StoryPicture, from: number, to: number, caption: DotStoryText[]): StoryBeat {
	const ageAt = (heldSeconds: number) => from + (to - from) * easeInOut(clamp01((heldSeconds - TURN.startsAt) / TURN.seconds));
	const beat = captioned(picture, TURN.startsAt + TURN.seconds + 1.1, (states, heldSeconds) => void paintDial(states, ageAt(heldSeconds)), caption, TURN.startsAt + TURN.seconds);
	return {
		...beat,
		departure,
		write(pen, heldSeconds) {
			const [label, value, detail] = caption;
			const reading = Math.round(((ageAt(heldSeconds) / CACHED_AGE) * ONE_HOUR_MS) / MS_STEP) * MS_STEP;
			pen.text(label);
			pen.text({ ...value, text: String(reading) });
			pen.text(detail, clamp01((heldSeconds - TURN.startsAt - TURN.seconds) / DETAIL.fadeSeconds));
			DIAL_LABELS.forEach((dialLabel) => pen.text(dialLabel));
		},
	};
}

export function createFreshnessStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: FRESHNESS_STORY_GRID,
		resting: { beat: 3, heldSeconds: 2 },
		beats: [
			dialBeat(DIAL_FRESH, DIAL_CACHED, 0, CACHED_AGE, CAPTIONS.acceptCached),
			captioned(CACHE_AT_REST, 2.6, (states, heldSeconds) => void paintCache(states, clamp01((heldSeconds - READ.startsAt) / READ.seconds)), CAPTIONS.cached, READ.startsAt + READ.seconds),
			dialBeat(DIAL_CACHED, DIAL_FRESH, CACHED_AGE, 0, CAPTIONS.requireFresh),
			captioned(GLOBE_AT_REST, 3, (states, heldSeconds) => void paintGlobe(states, heldSeconds * GLOBE_TURNS_PER_SECOND * GLOBE_TURN), CAPTIONS.fresh, 0.5),
		],
	});
}
