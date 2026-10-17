'use client';

import { FREE_TOOLS_RESTING } from '@/components/visuals/stories/free-tools-hero-story-scenes';
import { HERO_STORY_GRID } from '@/components/visuals/stories/hero-story-kit';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadFreeToolsHeroStory: LoadDotStory = async (stage) => {
	const { createFreeToolsHeroStoryPlayer } = await import('@/components/visuals/stories/free-tools-hero-story-player');
	return createFreeToolsHeroStoryPlayer(stage);
};

/**
 * The free tools hero's picture: a shelf of tools lighting up one by one, then one of them run on a URL. With
 * reduced motion it shows the tool's results.
 */
export function FreeToolsHeroStory({ className }: { className?: string }) {
	return <DotStory grid={HERO_STORY_GRID} resting={FREE_TOOLS_RESTING} load={loadFreeToolsHeroStory} className={className} />;
}
