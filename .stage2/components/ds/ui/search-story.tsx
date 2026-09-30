'use client';

import { SEARCH_RESTING, SEARCH_STORY_GRID } from '@/components/ds/ui/search-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadSearchStory: LoadDotStory = async (stage) => {
	const { createSearchStoryPlayer } = await import('@/components/ds/ui/search-story-player');
	return createSearchStoryPlayer(stage);
};

/**
 * The Search card's picture: a question is typed at an old terminal, which becomes three ranked results with their
 * pages read. With reduced motion it shows the results.
 */
export function SearchStory({ className }: { className?: string }) {
	return <DotStory grid={SEARCH_STORY_GRID} resting={SEARCH_RESTING} load={loadSearchStory} className={className} />;
}
