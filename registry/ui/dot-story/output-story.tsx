'use client';

import { OUTPUT_RESTING, OUTPUT_STORY_GRID } from '@/components/ds/ui/output-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadOutputStory: LoadDotStory = async (stage) => {
	const { createOutputStoryPlayer } = await import('@/components/ds/ui/output-story-player');
	return createOutputStoryPlayer(stage);
};

/**
 * The "Choose your output" card's picture: a switch is thrown for each format under a live page, which becomes the
 * three files the request returns. With reduced motion it shows the files.
 */
export function OutputStory({ className }: { className?: string }) {
	return <DotStory grid={OUTPUT_STORY_GRID} resting={OUTPUT_RESTING} load={loadOutputStory} className={className} />;
}
