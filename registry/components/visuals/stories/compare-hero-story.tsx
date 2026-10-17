'use client';

import { COMPARE_RESTING } from '@/components/visuals/stories/compare-hero-story-scenes';
import { HERO_STORY_GRID } from '@/components/visuals/stories/hero-story-kit';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadCompareHeroStory: LoadDotStory = async (stage) => {
	const { createCompareHeroStoryPlayer } = await import('@/components/visuals/stories/compare-hero-story-player');
	return createCompareHeroStoryPlayer(stage);
};

/**
 * The compare hero's picture: two tools checked feature by feature, then their bars rising side by side. With
 * reduced motion it shows the finished feature table.
 */
export function CompareHeroStory({ className }: { className?: string }) {
	return <DotStory grid={HERO_STORY_GRID} resting={COMPARE_RESTING} load={loadCompareHeroStory} className={className} />;
}
