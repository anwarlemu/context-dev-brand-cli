import { ACTIONS_STORY_GRID, CAPTIONS, HOURGLASS_AT_REST, HOURGLASS_RUN_OUT, MOUSE_AT_REST, PAGE_LOADING, PAGE_RENDERED, POINTER_AT_REST, paintHourglass, paintMouse, paintPointer, renderingOrder } from '@/components/ds/ui/actions-story-scenes';
import { createBeatStoryPlayer, typingSeconds, type StoryBeat, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { clamp01, easeOut } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage, DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * One scrape of a dynamic page, played as a loop: a pointer clicks, an hourglass runs while the content loads, a
 * mouse scrolls to the end, each melting into the next with its action typed beside it; then the page itself
 * arrives, still loading, and renders from the top down.
 */

const MELT_SECONDS = 1.1;
const TYPING = { startsAt: 0.15, charactersPerSecond: 16 };
const DETAIL_FADE_SECONDS = 0.3;
const CLICKS = { startAt: [1, 1.5], seconds: 0.45 };
const SAND = { startsAt: 0.3, seconds: 2 };
const ROLL = { startsAt: 0.3, seconds: 0.7, times: 3 };
const RENDER_SECONDS = 1.3;

const clickedAt = (heldSeconds: number) => {
	const startedAt = CLICKS.startAt.findLast((at) => heldSeconds >= at);
	return startedAt === undefined ? 0 : easeOut(clamp01((heldSeconds - startedAt) / CLICKS.seconds));
};

// The wheel comes back to the top of its slot after its last roll, where the picture that melts away has it.
const rolledAt = (heldSeconds: number) => {
	const rolls = (heldSeconds - ROLL.startsAt) / ROLL.seconds;
	return rolls < 0 || rolls >= ROLL.times ? 0 : easeOut(rolls % 1);
};

function actionBeat(picture: StoryPicture, [step, action, detail]: DotStoryText[], holdSeconds: number, animate?: StoryBeat['animate']): StoryBeat {
	const typedAt = TYPING.startsAt + typingSeconds(action, TYPING.charactersPerSecond);
	return {
		picture,
		arrival: { kind: 'melts', seconds: MELT_SECONDS },
		holdSeconds,
		animate,
		write(pen, heldSeconds) {
			pen.text(step);
			pen.type(action, heldSeconds, TYPING);
			pen.text(detail, clamp01((heldSeconds - typedAt) / DETAIL_FADE_SECONDS));
		},
	};
}

export function createActionsStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: ACTIONS_STORY_GRID,
		resting: { beat: 4, heldSeconds: 2.6 },
		beats: [
			actionBeat(POINTER_AT_REST, CAPTIONS.click, 2.3, (states, heldSeconds) => void paintPointer(states, clickedAt(heldSeconds))),
			{ ...actionBeat(HOURGLASS_AT_REST, CAPTIONS.wait, SAND.startsAt + SAND.seconds + 0.4, (states, heldSeconds) => void paintHourglass(states, clamp01((heldSeconds - SAND.startsAt) / SAND.seconds))), departure: HOURGLASS_RUN_OUT },
			actionBeat(MOUSE_AT_REST, CAPTIONS.scroll, ROLL.startsAt + ROLL.seconds * ROLL.times + 0.2, (states, heldSeconds) => void paintMouse(states, rolledAt(heldSeconds))),
			{ picture: PAGE_LOADING, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.3 },
			{ ...actionBeat(PAGE_RENDERED, CAPTIONS.scrape, 3.4), arrival: { kind: 'builds', seconds: RENDER_SECONDS, order: renderingOrder } },
		],
	});
}
