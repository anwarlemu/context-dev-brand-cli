'use client';

import { FRESHNESS_RESTING, FRESHNESS_STORY_GRID } from '@/components/ds/ui/freshness-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadFreshnessStory: LoadDotStory = async (stage) => {
	const { createFreshnessStoryPlayer } = await import('@/components/ds/ui/freshness-story-player');
	return createFreshnessStoryPlayer(stage);
};

/**
 * The "Control freshness" card's picture: a dial sets how old a copy may be, and becomes the cache or the live web
 * the page then comes from. With reduced motion it shows the live capture.
 */
export function FreshnessStory({ className }: { className?: string }) {
	return <DotStory grid={FRESHNESS_STORY_GRID} resting={FRESHNESS_RESTING} load={loadFreshnessStory} className={className} />;
}
