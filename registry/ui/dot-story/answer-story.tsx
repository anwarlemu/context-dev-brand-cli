'use client';

import { ANSWER_RESTING, ANSWER_STORY_GRID } from '@/components/ds/ui/answer-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadAnswerStory: LoadDotStory = async (stage) => {
	const { createAnswerStoryPlayer } = await import('@/components/ds/ui/answer-story-player');
	return createAnswerStoryPlayer(stage);
};

/**
 * The Research card's picture: a question is asked, its sources are read, and the answer is written between a pair
 * of braces in the shape that was asked for. With reduced motion it shows the answer.
 */
export function AnswerStory({ className }: { className?: string }) {
	return <DotStory grid={ANSWER_STORY_GRID} resting={ANSWER_RESTING} load={loadAnswerStory} className={className} />;
}
