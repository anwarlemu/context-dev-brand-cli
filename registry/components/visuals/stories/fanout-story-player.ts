import { BRANCH_ROW, DROP, FANNED_OUT, FANOUT_LABEL, FANOUT_STORY_GRID, PARALLEL_LABEL, QUESTION, QUESTION_LABEL, QUESTION_ONLY, RESULT_ROWS, SEARCHES, SEARCH_FIELD, SEARCH_QUERIES, STEM } from '@/components/visuals/stories/fanout-story-scenes';
import { fadedInAt, paintRevealed, revealSchedule } from '@/components/visuals/stories/story-reveal';
import { createBeatStoryPlayer, typingSeconds } from '@/components/visuals/dot-engine/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

const CLEAR_SECONDS = 0.8;
const TYPING = { startsAt: 0.4, charactersPerSecond: 14 };
const TYPED_AT = TYPING.startsAt + typingSeconds(QUESTION, TYPING.charactersPerSecond);
const FANOUT = { startsAt: TYPED_AT + 0.4, secondsPerRow: 0.06, secondsPerColumn: 0.02 };
const BRANCHED_AT = FANOUT.startsAt + (BRANCH_ROW - STEM.top) * FANOUT.secondsPerRow;
const SEARCHES_AT = BRANCHED_AT + 1;
const RESULTS = { startsAt: SEARCHES_AT + 0.7, everyLineSeconds: 0.15, sweepSeconds: 0.4 };
const HOLD_SECONDS = RESULTS.startsAt + RESULT_ROWS.length * RESULTS.everyLineSeconds + RESULTS.sweepSeconds + 2.6;

const { rows } = FANOUT_STORY_GRID;
const branchedAt = (column: number) => BRANCHED_AT + Math.abs(column - STEM.column) * FANOUT.secondsPerColumn;

const FANNED_OUT_AT = revealSchedule(FANOUT_STORY_GRID, (column, row) => {
	if (row < STEM.top) return 0;
	if (row <= BRANCH_ROW) return row === BRANCH_ROW ? branchedAt(column) : FANOUT.startsAt + (row - STEM.top) * FANOUT.secondsPerRow;
	if (row <= DROP.bottom) return branchedAt(column) + (row - BRANCH_ROW) * FANOUT.secondsPerRow;
	if (row <= SEARCH_FIELD.bottom) return SEARCHES_AT + (row - SEARCH_FIELD.top) * FANOUT.secondsPerRow;
	const search = SEARCHES.find(({ left, right }) => column >= left && column <= right) ?? SEARCHES[0];
	return RESULTS.startsAt + RESULT_ROWS.indexOf(row) * RESULTS.everyLineSeconds + ((column - search.left) / (search.right - search.left)) * RESULTS.sweepSeconds;
});

export function createFanoutStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: FANOUT_STORY_GRID,
		resting: { beat: 0, heldSeconds: HOLD_SECONDS },
		beats: [
			{
				picture: QUESTION_ONLY,
				departure: FANNED_OUT,
				arrival: { kind: 'builds', seconds: CLEAR_SECONDS, order: (_, row) => 1 - row / rows },
				holdSeconds: HOLD_SECONDS,
				animate: (states, heldSeconds) => paintRevealed(states, FANNED_OUT.states, FANNED_OUT_AT, heldSeconds),
				write(pen, heldSeconds) {
					pen.text(QUESTION_LABEL);
					pen.type(QUESTION, heldSeconds, TYPING);
					pen.text(FANOUT_LABEL, fadedInAt(heldSeconds, FANOUT.startsAt));
					SEARCH_QUERIES.forEach((query) => pen.text(query, fadedInAt(heldSeconds, SEARCHES_AT + 0.2)));
					pen.text(PARALLEL_LABEL, fadedInAt(heldSeconds, RESULTS.startsAt + 0.3));
				},
			},
		],
	});
}
