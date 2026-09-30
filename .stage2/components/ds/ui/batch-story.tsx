'use client';

import { BATCH_RESTING, BATCH_STORY_GRID } from '@/components/ds/ui/batch-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadBatchStory: LoadDotStory = async (stage) => {
	const { createBatchStoryPlayer } = await import('@/components/ds/ui/batch-story-player');
	return createBatchStoryPlayer(stage);
};

/**
 * The "Run batches at scale" card's picture: a job counts up to 25,000 URLs, becomes a page of results beside an open
 * box, and the page is packed into the box as one dataset. With reduced motion it shows the closed box.
 */
export function BatchStory({ className }: { className?: string }) {
	return <DotStory grid={BATCH_STORY_GRID} resting={BATCH_RESTING} load={loadBatchStory} className={className} />;
}
