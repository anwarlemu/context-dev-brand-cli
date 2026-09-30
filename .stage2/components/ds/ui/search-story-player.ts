import { KEYS, QUERY_LINES, RESULTS_FILLED, RESULTS_READ, RESULT_TEXTS, SCREEN_LABEL, SEARCH_STORY_GRID, TERMINAL, resultAt } from '@/components/ds/ui/search-story-scenes';
import { DOT_FILLED } from '@/components/ds/ui/dot-morph-dots';
import { createBeatStoryPlayer, typingSeconds } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One search, played as a loop: the question is typed at the terminal, a key going down with each letter; the
 * terminal melts into three ranked results; their rings clear one result at a time and what was read is written in.
 */

const TYPING = { startsAt: 0.5, charactersPerSecond: 11 };
const SECOND_LINE_AT = TYPING.startsAt + typingSeconds(QUERY_LINES[0], TYPING.charactersPerSecond);
const TYPED_AT = SECOND_LINE_AT + typingSeconds(QUERY_LINES[1], TYPING.charactersPerSecond);
const MELT_SECONDS = 1.1;
const READ = { seconds: 1.2, everySeconds: 0.45, textSeconds: 0.3 };

const { columns } = SEARCH_STORY_GRID;

// A different key for each letter, the same ones every loop.
function pressKey(states: Uint8Array, heldSeconds: number) {
	if (heldSeconds < TYPING.startsAt || heldSeconds > TYPED_AT) return;
	const letter = Math.floor((heldSeconds - TYPING.startsAt) * TYPING.charactersPerSecond);
	const key = KEYS[(letter * 37 + 11) % KEYS.length];
	states[key.row * columns + key.column] = DOT_FILLED;
}

export function createSearchStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: SEARCH_STORY_GRID,
		resting: { beat: 2, heldSeconds: 2.4 },
		beats: [
			{
				picture: TERMINAL,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: TYPED_AT + 0.9,
				animate: pressKey,
				write(pen, heldSeconds) {
					pen.text(SCREEN_LABEL);
					pen.type(QUERY_LINES[0], heldSeconds, { ...TYPING, cursorLingers: 0 });
					pen.type(QUERY_LINES[1], heldSeconds, { ...TYPING, startsAt: SECOND_LINE_AT, cursorLingers: Infinity });
				},
			},
			{ picture: RESULTS_FILLED, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.2 },
			{
				picture: RESULTS_READ,
				// Top result first, each one clearing from its rank towards its end.
				arrival: { kind: 'builds', seconds: READ.seconds, order: (column, row) => (resultAt(row) + column / columns) / RESULT_TEXTS.length },
				holdSeconds: 3.6,
				write(pen, heldSeconds) {
					RESULT_TEXTS.forEach((texts, index) => texts.forEach((text) => pen.text(text, clamp01((heldSeconds - index * READ.everySeconds) / READ.textSeconds))));
				},
			},
			{ picture: RESULTS_FILLED, arrival: { kind: 'builds', seconds: 0.5, order: (column) => column / columns }, holdSeconds: 0.1 },
		],
	});
}
