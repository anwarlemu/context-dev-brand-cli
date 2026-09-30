import { FIELD_TEXTS, PROSE_LABEL, PROSE_PICTURE, SHAPE_EMPTY, SHAPE_FILLED, STRUCTURE_STORY_GRID, paintFields } from '@/components/ds/ui/structure-story-scenes';
import { createBeatStoryPlayer, typingSeconds } from '@/components/ds/ui/dot-story-beats';
import { clamp01, easeOut } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One answer, played as a loop: what the web says, a ragged paragraph, melts into the shape that was asked for, a
 * tree of empty fields; then each field's slot clears from its key outwards and its value is typed into it.
 */

const MELT_SECONDS = 1.1;
const FILLING = { startsAt: 0.9, everySeconds: 0.9, seconds: 0.4 };
const TYPING = { afterSeconds: 0.2, charactersPerSecond: 18 };
const FILLED_HOLD_SECONDS = 2.6;

const fillsAt = (field: number) => FILLING.startsAt + field * FILLING.everySeconds;
const lastField = FIELD_TEXTS.length - 1;
const FILLED_AT = fillsAt(lastField) + TYPING.afterSeconds + typingSeconds(FIELD_TEXTS[lastField].value, TYPING.charactersPerSecond);

export function createStructureStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: STRUCTURE_STORY_GRID,
		resting: { beat: 1, heldSeconds: FILLED_AT + 1 },
		beats: [
			{ picture: PROSE_PICTURE, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 2.2, write: (pen) => pen.text(PROSE_LABEL) },
			{
				picture: SHAPE_EMPTY,
				departure: SHAPE_FILLED,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: FILLED_AT + FILLED_HOLD_SECONDS,
				animate: (states, heldSeconds) =>
					void paintFields(
						states,
						FIELD_TEXTS.map((_, field) => easeOut(clamp01((heldSeconds - fillsAt(field)) / FILLING.seconds)))
					),
				write(pen, heldSeconds) {
					FIELD_TEXTS.forEach(({ key, value }, field) => {
						pen.text(key);
						pen.type(value, heldSeconds, { startsAt: fillsAt(field) + TYPING.afterSeconds, charactersPerSecond: TYPING.charactersPerSecond });
					});
				},
			},
		],
	});
}
