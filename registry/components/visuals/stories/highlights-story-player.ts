import { BLANK, CARD, HIGHLIGHTED_LINES, HIGHLIGHTS_LABEL, HIGHLIGHTS_STORY_GRID, MARKER, PASSAGE_LEFT, RELEVANCE_LABEL, RESULT_HIGHLIGHTED, RESULT_READ, RESULT_TEXTS } from '@/components/visuals/stories/highlights-story-scenes';
import { NEVER, fadedInAt, paintRevealed, revealSchedule } from '@/components/visuals/stories/story-reveal';
import { createBeatStoryPlayer } from '@/components/visuals/dot-engine/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

const CLEAR_SECONDS = 0.8;
const RESULT = { startsAt: 0.2, buildSeconds: 0.8, textsAt: 0.6, relevanceAt: 0.9 };
const HIGHLIGHT = { startsAt: 1.8, everyLineSeconds: 0.35, sweepSeconds: 0.5, markerSecondsPerRow: 0.08 };
const HOLD_SECONDS = HIGHLIGHT.startsAt + HIGHLIGHTED_LINES.length * HIGHLIGHT.everyLineSeconds + HIGHLIGHT.sweepSeconds + 2.6;

const { rows } = HIGHLIGHTS_STORY_GRID;

const READ_AT = revealSchedule(HIGHLIGHTS_STORY_GRID, (_, row) => RESULT.startsAt + ((row - CARD.top) / (CARD.bottom - CARD.top)) * RESULT.buildSeconds);

const HIGHLIGHTED_AT = revealSchedule(HIGHLIGHTS_STORY_GRID, (column, row) => {
	if (column === MARKER.column && row >= MARKER.top && row <= MARKER.bottom) return HIGHLIGHT.startsAt + (row - MARKER.top) * HIGHLIGHT.markerSecondsPerRow;
	const line = HIGHLIGHTED_LINES.findIndex((candidate) => candidate.row === row);
	if (line < 0) return NEVER;
	return HIGHLIGHT.startsAt + line * HIGHLIGHT.everyLineSeconds + ((column - PASSAGE_LEFT) / (HIGHLIGHTED_LINES[line].right - PASSAGE_LEFT)) * HIGHLIGHT.sweepSeconds;
});

export function createHighlightsStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: HIGHLIGHTS_STORY_GRID,
		resting: { beat: 0, heldSeconds: HOLD_SECONDS },
		beats: [
			{
				picture: BLANK,
				departure: RESULT_HIGHLIGHTED,
				arrival: { kind: 'builds', seconds: CLEAR_SECONDS, order: (_, row) => row / rows },
				holdSeconds: HOLD_SECONDS,
				animate(states, heldSeconds) {
					paintRevealed(states, RESULT_READ.states, READ_AT, heldSeconds);
					paintRevealed(states, RESULT_HIGHLIGHTED.states, HIGHLIGHTED_AT, heldSeconds);
				},
				write(pen, heldSeconds) {
					RESULT_TEXTS.forEach((text) => pen.text(text, fadedInAt(heldSeconds, RESULT.textsAt)));
					pen.text(RELEVANCE_LABEL, fadedInAt(heldSeconds, RESULT.relevanceAt));
					pen.text(HIGHLIGHTS_LABEL, fadedInAt(heldSeconds, HIGHLIGHT.startsAt + 0.2));
				},
			},
		],
	});
}
