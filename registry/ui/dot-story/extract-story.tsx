'use client';

import { EXTRACT_RESTING, EXTRACT_STORY_GRID } from '@/components/ds/ui/extract-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadExtractStory: LoadDotStory = async (stage) => {
	const { createExtractStoryPlayer } = await import('@/components/ds/ui/extract-story-player');
	return createExtractStoryPlayer(stage);
};

/**
 * The Extract card's picture: a scan reads a published page, which becomes a window with the page's Markdown typed
 * into it. With reduced motion it shows the Markdown.
 */
export function ExtractStory({ className }: { className?: string }) {
	return <DotStory grid={EXTRACT_STORY_GRID} resting={EXTRACT_RESTING} load={loadExtractStory} className={className} />;
}
