import { CAPTIONS, MAGNIFIER_AT_REST, PAGES, QUESTION_MARK, QUESTION_STORY_GRID, READING_REPEATS_EVERY, paintMagnifier } from '@/components/ds/ui/question-story-scenes';
import { createBeatStoryPlayer, typingSeconds, type StoryBeat } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One research task, played as a loop: the pile of pages it would take by hand is counted up, melts into the
 * question that is asked instead, and the question melts into a magnifier with the pages going by under its glass.
 */

const MELT_SECONDS = 1.1;
const COUNTING = { startsAt: 0.2, seconds: 1.2, pages: 9 };
const TYPING = { startsAt: 0.15, charactersPerSecond: 12 };
const DETAIL_FADE_SECONDS = 0.3;
// The page under the glass is back where it started as the magnifier melts away.
const READING_SECONDS = 3;

const melts: StoryBeat['arrival'] = { kind: 'melts', seconds: MELT_SECONDS };

export function createQuestionStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const [byHandLabel, byHandCount, byHandDetail] = CAPTIONS.byHand;
	const [askLabel, ask, question] = CAPTIONS.ask;
	const [readLabel, reads, readDetail] = CAPTIONS.read;
	const askedAt = TYPING.startsAt + typingSeconds(ask, TYPING.charactersPerSecond);
	return createBeatStoryPlayer(stage, {
		grid: QUESTION_STORY_GRID,
		resting: { beat: 1, heldSeconds: 2 },
		beats: [
			{
				picture: PAGES,
				arrival: melts,
				holdSeconds: 2.4,
				write(pen, heldSeconds) {
					const counted = Math.max(1, Math.ceil(clamp01((heldSeconds - COUNTING.startsAt) / COUNTING.seconds) * COUNTING.pages));
					pen.text(byHandLabel);
					pen.text({ ...byHandCount, text: `${counted} ${counted === 1 ? 'page' : 'pages'}` });
					pen.text(byHandDetail, clamp01((heldSeconds - COUNTING.startsAt - COUNTING.seconds) / DETAIL_FADE_SECONDS));
				},
			},
			{
				picture: QUESTION_MARK,
				arrival: melts,
				holdSeconds: 2.8,
				write(pen, heldSeconds) {
					pen.text(askLabel);
					pen.type(ask, heldSeconds, TYPING);
					pen.text(question, clamp01((heldSeconds - askedAt) / DETAIL_FADE_SECONDS));
				},
			},
			{
				picture: MAGNIFIER_AT_REST,
				arrival: melts,
				holdSeconds: READING_SECONDS,
				animate: (states, heldSeconds) => void paintMagnifier(states, (heldSeconds / READING_SECONDS) * READING_REPEATS_EVERY),
				write(pen, heldSeconds) {
					pen.text(readLabel);
					pen.text(reads);
					pen.text(readDetail, clamp01((heldSeconds - 0.4) / DETAIL_FADE_SECONDS));
				},
			},
		],
	});
}
