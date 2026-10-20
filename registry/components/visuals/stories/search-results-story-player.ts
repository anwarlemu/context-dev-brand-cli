import { FIELD_ONLY, FRESHNESS_LABEL, HIGHLIGHTS, PASSAGE, QUERY, RESULT_COUNT, RESULT_TEXTS, RESULTS_FOUND, RESULTS_HIGHLIGHTED, SEARCH_RESULTS_STORY_GRID, resultAt, resultTop } from '@/components/visuals/stories/search-results-story-scenes';
import { NEVER, fadedInAt, paintRevealed, revealSchedule } from '@/components/visuals/stories/story-reveal';
import { createBeatStoryPlayer, typingSeconds } from '@/components/visuals/dot-engine/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

const CLEAR_SECONDS = 0.8;
const TYPING = { startsAt: 0.4, charactersPerSecond: 14 };
const TYPED_AT = TYPING.startsAt + typingSeconds(QUERY, TYPING.charactersPerSecond);
const RESULTS = { startsAt: TYPED_AT + 0.3, everySeconds: 0.35, sweepSeconds: 0.5, textDelay: 0.3 };
const HIGHLIGHT = { startsAt: RESULTS.startsAt + RESULT_COUNT * RESULTS.everySeconds + 0.6, everySeconds: 0.4, sweepSeconds: 0.5 };
const HOLD_SECONDS = HIGHLIGHT.startsAt + RESULT_COUNT * HIGHLIGHT.everySeconds + 2.4;

const { columns, rows } = SEARCH_RESULTS_STORY_GRID;
const resultStartsAt = (index: number) => RESULTS.startsAt + index * RESULTS.everySeconds;
const highlightStartsAt = (index: number) => HIGHLIGHT.startsAt + index * HIGHLIGHT.everySeconds;

const FOUND_AT = revealSchedule(SEARCH_RESULTS_STORY_GRID, (column, row) => {
	const index = resultAt(row);
	return index < 0 ? 0 : resultStartsAt(index) + (column / columns) * RESULTS.sweepSeconds;
});

const HIGHLIGHTED_AT = revealSchedule(SEARCH_RESULTS_STORY_GRID, (column, row) => {
	const index = resultAt(row);
	if (index < 0 || row !== resultTop(index) + PASSAGE.row) return NEVER;
	const { from, to } = HIGHLIGHTS[index];
	return highlightStartsAt(index) + ((column - from) / (to - from + 1)) * HIGHLIGHT.sweepSeconds;
});

export function createSearchResultsStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: SEARCH_RESULTS_STORY_GRID,
		resting: { beat: 0, heldSeconds: HOLD_SECONDS },
		beats: [
			{
				picture: FIELD_ONLY,
				departure: RESULTS_HIGHLIGHTED,
				arrival: { kind: 'builds', seconds: CLEAR_SECONDS, order: (_, row) => 1 - row / rows },
				holdSeconds: HOLD_SECONDS,
				animate(states, heldSeconds) {
					paintRevealed(states, RESULTS_FOUND.states, FOUND_AT, heldSeconds);
					paintRevealed(states, RESULTS_HIGHLIGHTED.states, HIGHLIGHTED_AT, heldSeconds);
				},
				write(pen, heldSeconds) {
					pen.text(FRESHNESS_LABEL);
					pen.type(QUERY, heldSeconds, TYPING);
					RESULT_TEXTS.forEach((texts, index) => texts.forEach((text) => pen.text(text, fadedInAt(heldSeconds, resultStartsAt(index) + RESULTS.textDelay))));
				},
			},
		],
	});
}
