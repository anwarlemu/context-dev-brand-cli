'use client';

import { SOURCES_RESTING, SOURCES_STORY_GRID } from '@/components/ds/ui/sources-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadSourcesStory: LoadDotStory = async (stage) => {
	const { createSourcesStoryPlayer } = await import('@/components/ds/ui/sources-story-player');
	return createSourcesStoryPlayer(stage);
};

/**
 * The "Keep the sources" card's picture: an answer becomes the link its claims keep, then the answer again with
 * each claim tied to its numbered URL. With reduced motion it shows the cited answer.
 */
export function SourcesStory({ className }: { className?: string }) {
	return <DotStory grid={SOURCES_STORY_GRID} resting={SOURCES_RESTING} load={loadSourcesStory} className={className} />;
}
