'use client';

import { COLLECT_RESTING, COLLECT_STORY_GRID } from '@/components/ds/ui/collect-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadCollectStory: LoadDotStory = async (stage) => {
	const { createCollectStoryPlayer } = await import('@/components/ds/ui/collect-story-player');
	return createCollectStoryPlayer(stage);
};

/**
 * The "Collect the dataset" card's picture: a ring fills as the job runs, becomes the results a page at a time,
 * then the paper plane of the completion webhook. With reduced motion it shows the full ring.
 */
export function CollectStory({ className }: { className?: string }) {
	return <DotStory grid={COLLECT_STORY_GRID} resting={COLLECT_RESTING} load={loadCollectStory} className={className} />;
}
