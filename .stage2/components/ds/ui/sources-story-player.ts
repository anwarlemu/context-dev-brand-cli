import { ANSWER, CAPTIONS, CHAIN, CITED, CLAIM_COUNT, SOURCES_STORY_GRID, SOURCE_TEXTS, UNCITED, paintCited } from '@/components/ds/ui/sources-story-scenes';
import { createBeatStoryPlayer, type StoryBeat, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage, DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * One cited answer, played as a loop: the answer as a written page melts into the link each of its claims keeps;
 * the link melts back into the page, and one claim at a time is tied to the numbered URL it came from.
 */

const MELT_SECONDS = 1.1;
const DETAIL = { at: 0.5, fadeSeconds: 0.3 };
const CITING = { startsAt: 0.5, everySeconds: 0.7, textSeconds: 0.3 };
const CITED_HOLD_SECONDS = 3;
const CITED_AT = CITING.startsAt + (CLAIM_COUNT - 1) * CITING.everySeconds + CITING.textSeconds;

const citedAt = (claim: number) => CITING.startsAt + claim * CITING.everySeconds;

function captioned(picture: StoryPicture, [label, value, detail]: DotStoryText[]): StoryBeat {
	return {
		picture,
		arrival: { kind: 'melts', seconds: MELT_SECONDS },
		holdSeconds: 2.4,
		write(pen, heldSeconds) {
			pen.text(label);
			pen.text(value);
			pen.text(detail, clamp01((heldSeconds - DETAIL.at) / DETAIL.fadeSeconds));
		},
	};
}

export function createSourcesStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: SOURCES_STORY_GRID,
		resting: { beat: 2, heldSeconds: CITED_AT + 1 },
		beats: [
			captioned(ANSWER, CAPTIONS.answer),
			captioned(CHAIN, CAPTIONS.links),
			{
				picture: UNCITED,
				departure: CITED,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: CITED_AT + CITED_HOLD_SECONDS,
				animate: (states, heldSeconds) => void paintCited(states, heldSeconds < CITING.startsAt ? 0 : Math.min(CLAIM_COUNT, Math.floor((heldSeconds - CITING.startsAt) / CITING.everySeconds) + 1)),
				write: (pen, heldSeconds) => SOURCE_TEXTS.forEach((texts, claim) => texts.forEach((text) => pen.text(text, clamp01((heldSeconds - citedAt(claim)) / CITING.textSeconds)))),
			},
		],
	});
}
