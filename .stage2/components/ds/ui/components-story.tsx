'use client';

import { COMPONENTS_RESTING, COMPONENTS_STORY_GRID } from '@/components/ds/ui/components-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadComponentsStory: LoadDotStory = async (stage) => {
	const { createComponentsStoryPlayer } = await import('@/components/ds/ui/components-story-player');
	return createComponentsStoryPlayer(stage);
};

/**
 * The "Component details" card's picture: a button rounds to the site's radius and becomes a card, then the sun
 * and moon of its light and dark themes. With reduced motion it shows the card.
 */
export function ComponentsStory({ className }: { className?: string }) {
	return <DotStory grid={COMPONENTS_STORY_GRID} resting={COMPONENTS_RESTING} load={loadComponentsStory} className={className} />;
}
