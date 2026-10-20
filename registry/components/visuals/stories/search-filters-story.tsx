'use client';

import { SEARCH_FILTERS_RESTING, SEARCH_FILTERS_STORY_GRID } from '@/components/visuals/stories/search-filters-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadSearchFiltersStory: LoadDotStory = async (stage) => {
	const { createSearchFiltersStoryPlayer } = await import('@/components/visuals/stories/search-filters-story-player');
	return createSearchFiltersStoryPlayer(stage);
};

export function SearchFiltersStory({ className }: { className?: string }) {
	return <DotStory grid={SEARCH_FILTERS_STORY_GRID} resting={SEARCH_FILTERS_RESTING} load={loadSearchFiltersStory} className={className} />;
}
