'use client';

import { DATASETS_RESTING } from '@/components/visuals/stories/datasets-hero-story-scenes';
import { HERO_STORY_GRID } from '@/components/visuals/stories/hero-story-kit';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadDatasetsHeroStory: LoadDotStory = async (stage) => {
	const { createDatasetsHeroStoryPlayer } = await import('@/components/visuals/stories/datasets-hero-story-player');
	return createDatasetsHeroStoryPlayer(stage);
};

/**
 * The datasets hero's picture: source documents collected one by one, then the table they are delivered as filling
 * row by row. With reduced motion it shows the finished dataset.
 */
export function DatasetsHeroStory({ className }: { className?: string }) {
	return <DotStory grid={HERO_STORY_GRID} resting={DATASETS_RESTING} load={loadDatasetsHeroStory} className={className} />;
}
