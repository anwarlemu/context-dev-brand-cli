'use client';

import { BATCHES_RESTING, BATCHES_STORY_GRID } from '@/components/visuals/stories/batches-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const load: LoadDotStory = async (stage) => {
	const { createBatchesStoryPlayer } = await import('@/components/visuals/stories/batches-story-player');
	return createBatchesStoryPlayer(stage);
};

/** The Batches empty state's picture: a batch reads its sources, then counts through its URLs as its progress fills. */
export function BatchesStory({ className }: { className?: string }) {
	return <DotStory grid={BATCHES_STORY_GRID} resting={BATCHES_RESTING} load={load} className={className} />;
}
