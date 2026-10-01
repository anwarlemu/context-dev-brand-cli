'use client';

import { GENERATE_RESTING, GENERATE_STORY_GRID } from '@/components/ds/ui/generate-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadGenerateStory: LoadDotStory = async (stage) => {
	const { createGenerateStoryPlayer } = await import('@/components/ds/ui/generate-story-player');
	return createGenerateStoryPlayer(stage);
};

/**
 * The Generative AI page's picture: a prompt naming a company becomes the spark of the model at work, then the email,
 * social post and landing page it makes in that company's brand. With reduced motion it shows what it made.
 */
export function GenerateStory({ className }: { className?: string }) {
	return <DotStory grid={GENERATE_STORY_GRID} resting={GENERATE_RESTING} load={loadGenerateStory} className={className} />;
}
