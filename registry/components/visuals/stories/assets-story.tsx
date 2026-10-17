'use client';

import { ASSETS_RESTING, ASSETS_STORY_GRID } from '@/components/visuals/stories/assets-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadAssetsStory: LoadDotStory = async (stage) => {
	const { createAssetsStoryPlayer } = await import('@/components/visuals/stories/assets-story-player');
	return createAssetsStoryPlayer(stage);
};

/**
 * The "Get the visual assets" card's picture: a brand's logo becomes its colors, then a company profile wearing
 * both. With reduced motion it shows the profile.
 */
export function AssetsStory({ className }: { className?: string }) {
	return <DotStory grid={ASSETS_STORY_GRID} resting={ASSETS_RESTING} load={loadAssetsStory} className={className} />;
}
