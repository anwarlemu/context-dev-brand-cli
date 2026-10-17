'use client';

import { GRANTS_RESTING } from '@/components/visuals/stories/grants-hero-story-scenes';
import { HERO_STORY_GRID } from '@/components/visuals/stories/hero-story-kit';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadGrantsHeroStory: LoadDotStory = async (stage) => {
	const { createGrantsHeroStoryPlayer } = await import('@/components/visuals/stories/grants-hero-story-player');
	return createGrantsHeroStoryPlayer(stage);
};

/**
 * The research grants hero's picture: a reward curve climbing as an experiment runs, then the grant's usage credits
 * awarded a tranche at a time. With reduced motion it shows the full award.
 */
export function GrantsHeroStory({ className }: { className?: string }) {
	return <DotStory grid={HERO_STORY_GRID} resting={GRANTS_RESTING} load={loadGrantsHeroStory} className={className} />;
}
