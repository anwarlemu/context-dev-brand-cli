import { GENERATE_STORY_GRID, OUTPUTS, OUTPUT_TEXTS, PROMPT_FIELD, PROMPT_FILLED, PROMPT_TEXT, SPARK_LABEL, SPARK_PICTURE, alongPrompt, paintSpark } from '@/components/ds/ui/generate-story-scenes';
import { createBeatStoryPlayer, typingSeconds } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One generation, played as a loop: a prompt naming a company is typed; its field melts into the spark of the model
 * at work, its small sparks twinkling in turn; and the spark melts into what it made, an email, a social post and a
 * landing page, named one after another.
 */

const MELT_SECONDS = 1.1;
const FIELD_WIPE_SECONDS = 0.45;
const TYPING = { startsAt: 0.4, charactersPerSecond: 13 };
// The small sparks end as they began, so the picture that melts away is the one that arrived.
const TWINKLE = { everySeconds: 0.45, times: 4 };
const NAMING = { startsAt: 0.2, everySeconds: 0.3, seconds: 0.3 };

export function createGenerateStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: GENERATE_STORY_GRID,
		resting: { beat: 4, heldSeconds: 2.4 },
		beats: [
			{ picture: PROMPT_FILLED, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.1 },
			{
				picture: PROMPT_FIELD,
				arrival: { kind: 'builds', seconds: FIELD_WIPE_SECONDS, order: alongPrompt },
				holdSeconds: TYPING.startsAt + typingSeconds(PROMPT_TEXT, TYPING.charactersPerSecond) + 0.8,
				write: (pen, heldSeconds) => pen.type(PROMPT_TEXT, heldSeconds, { ...TYPING, cursorLingers: Infinity }),
			},
			{ picture: PROMPT_FILLED, arrival: { kind: 'builds', seconds: FIELD_WIPE_SECONDS, order: alongPrompt }, holdSeconds: 0.1 },
			{
				picture: SPARK_PICTURE,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: TWINKLE.everySeconds * TWINKLE.times,
				animate: (states, heldSeconds) => void paintSpark(states, Math.floor(heldSeconds / TWINKLE.everySeconds) % 2),
				write: (pen) => pen.text(SPARK_LABEL),
			},
			{
				picture: OUTPUTS,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: 3.8,
				write: (pen, heldSeconds) => OUTPUT_TEXTS.forEach((texts, index) => texts.forEach((text) => pen.text(text, clamp01((heldSeconds - NAMING.startsAt - index * NAMING.everySeconds) / NAMING.seconds)))),
			},
		],
	});
}
