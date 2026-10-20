'use client';

import { SEARCH_RESULTS_RESTING, SEARCH_RESULTS_STORY_GRID } from '@/components/visuals/stories/search-results-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadSearchResultsStory: LoadDotStory = async (stage) => {
	const { createSearchResultsStoryPlayer } = await import('@/components/visuals/stories/search-results-story-player');
	return createSearchResultsStoryPlayer(stage);
};

export function SearchResultsStory({ className }: { className?: string }) {
	return <DotStory grid={SEARCH_RESULTS_STORY_GRID} resting={SEARCH_RESULTS_RESTING} load={loadSearchResultsStory} className={className} />;
}
