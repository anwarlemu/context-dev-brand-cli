'use client';

import { DISCOVER_RESTING, DISCOVER_STORY_GRID } from '@/components/ds/ui/discover-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadDiscoverStory: LoadDotStory = async (stage) => {
	const { createDiscoverStoryPlayer } = await import('@/components/ds/ui/discover-story-player');
	return createDiscoverStoryPlayer(stage);
};

/**
 * The "Discover page URLs" card's picture: a radar sweeps a domain and finds its pages, then becomes the list of
 * their URLs. With reduced motion it shows the list.
 */
export function DiscoverStory({ className }: { className?: string }) {
	return <DotStory grid={DISCOVER_STORY_GRID} resting={DISCOVER_RESTING} load={loadDiscoverStory} className={className} />;
}
