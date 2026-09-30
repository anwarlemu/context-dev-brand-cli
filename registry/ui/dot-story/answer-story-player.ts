import { ANSWER, ANSWER_STORY_GRID, BOOKS, BOOK_SIZE, BRACES, CITED, FIELD_COUNT, FIELD_TEXTS, QUESTION, QUESTION_LINES, SOURCES, SOURCES_LABEL, THINKING, fieldAt } from '@/components/ds/ui/answer-story-scenes';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/ds/ui/dot-morph-dots';
import { createBeatStoryPlayer, typingSeconds } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One piece of research, played as a loop: the question is typed into its bubble and the bubble thinks; it melts
 * into the sources, which are read one after another; they melt into a pair of braces, and the answer is written
 * between them field by field.
 */

const TYPING = { startsAt: 0.4, charactersPerSecond: 12 };
const SECOND_LINE_AT = TYPING.startsAt + typingSeconds(QUESTION_LINES[0], TYPING.charactersPerSecond);
const ASKED_AT = SECOND_LINE_AT + typingSeconds(QUESTION_LINES[1], TYPING.charactersPerSecond);
const THINK = { everySeconds: 0.25 };
const READ = { startsAt: 0.2, secondsEach: 0.7, width: 3 };
const MELT_SECONDS = 1.1;
const FIELD = { seconds: 1.4, everySeconds: 0.45, textSeconds: 0.3 };

const { columns } = ANSWER_STORY_GRID;

// The dots of an ellipsis, lit one after another once the question is asked.
function think(states: Uint8Array, heldSeconds: number) {
	for (const column of THINKING.columns) states[THINKING.row * columns + column] = DOT_ABSENT;
	if (heldSeconds < ASKED_AT) return;
	const lit = Math.floor((heldSeconds - ASKED_AT) / THINK.everySeconds) % (THINKING.columns.length + 1);
	THINKING.columns.forEach((column, index) => {
		if (index < lit) states[THINKING.row * columns + column] = DOT_FILLED;
	});
}

// A band crosses each book in turn, turning its dots over as it goes: the page being read.
function readSources(states: Uint8Array, heldSeconds: number) {
	const reading = (heldSeconds - READ.startsAt) / READ.secondsEach;
	const source = BOOKS[Math.floor(reading)];
	if (reading < 0 || !source) return;
	const band = source.left + BOOK_SIZE.spine + (reading % 1) * (BOOK_SIZE.columns - BOOK_SIZE.spine - BOOK_SIZE.pages);
	for (let row = source.top + 1; row < source.top + BOOK_SIZE.rows - 1; row++) {
		for (let column = Math.ceil(band - READ.width); column <= band; column++) {
			const cell = row * columns + column;
			if (column >= source.left + BOOK_SIZE.spine && states[cell] !== DOT_ABSENT) states[cell] = states[cell] === DOT_FILLED ? DOT_HOLLOW : DOT_FILLED;
		}
	}
}

export function createAnswerStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: ANSWER_STORY_GRID,
		resting: { beat: 3, heldSeconds: 2.6 },
		beats: [
			{
				picture: QUESTION,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: ASKED_AT + 1.2,
				animate: think,
				write(pen, heldSeconds) {
					pen.type(QUESTION_LINES[0], heldSeconds, { ...TYPING, cursorLingers: 0 });
					pen.type(QUESTION_LINES[1], heldSeconds, { ...TYPING, startsAt: SECOND_LINE_AT });
				},
			},
			{ picture: SOURCES, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: READ.startsAt + BOOKS.length * READ.secondsEach + 0.3, animate: readSources, write: (pen) => pen.text(SOURCES_LABEL) },
			{ picture: BRACES, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.1 },
			{
				picture: ANSWER,
				arrival: { kind: 'builds', seconds: FIELD.seconds, order: (_column, row) => fieldAt(row) / FIELD_COUNT },
				holdSeconds: 3.6,
				write(pen, heldSeconds) {
					FIELD_TEXTS.forEach((text, index) => pen.text(text, clamp01((heldSeconds - index * FIELD.everySeconds) / FIELD.textSeconds)));
					pen.text(CITED, clamp01((heldSeconds - FIELD_COUNT * FIELD.everySeconds) / FIELD.textSeconds));
				},
			},
		],
	});
}
