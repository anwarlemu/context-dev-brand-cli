'use client';

import { OUTPUT_RESTING, OUTPUT_STORY_GRID } from '@/components/visuals/stories/output-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadOutputStory: LoadDotStory = async (stage) => {
	const { createOutputStoryPlayer } = await import('@/components/visuals/stories/output-story-player');
	return createOutputStoryPlayer(stage);
};

/**
 * The "Choose your output" card's picture: a switch is thrown for each format under a live page, which becomes the
 * three files the request returns. With reduced motion it shows the files.
 */
export function OutputStory({ className }: { className?: string }) {
	return <DotStory grid={OUTPUT_STORY_GRID} resting={OUTPUT_RESTING} load={loadOutputStory} className={className} />;
}
