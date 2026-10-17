'use client';

import { GENERATE_RESTING, GENERATE_STORY_GRID } from '@/components/visuals/stories/generate-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadGenerateStory: LoadDotStory = async (stage) => {
	const { createGenerateStoryPlayer } = await import('@/components/visuals/stories/generate-story-player');
	return createGenerateStoryPlayer(stage);
};

/**
 * The Generative AI page's picture: a prompt naming a company becomes the spark of the model at work, then the email,
 * social post and landing page it makes in that company's brand. With reduced motion it shows what it made.
 */
export function GenerateStory({ className }: { className?: string }) {
	return <DotStory grid={GENERATE_STORY_GRID} resting={GENERATE_RESTING} load={loadGenerateStory} className={className} />;
}
