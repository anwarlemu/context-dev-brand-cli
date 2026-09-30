'use client';

import { QUESTION_RESTING, QUESTION_STORY_GRID } from '@/components/ds/ui/question-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadQuestionStory: LoadDotStory = async (stage) => {
	const { createQuestionStoryPlayer } = await import('@/components/ds/ui/question-story-player');
	return createQuestionStoryPlayer(stage);
};

/**
 * The "Start with a question" card's picture: a pile of pages becomes the question asked instead, then the
 * magnifier that reads for you. With reduced motion it shows the question.
 */
export function QuestionStory({ className }: { className?: string }) {
	return <DotStory grid={QUESTION_STORY_GRID} resting={QUESTION_RESTING} load={loadQuestionStory} className={className} />;
}
