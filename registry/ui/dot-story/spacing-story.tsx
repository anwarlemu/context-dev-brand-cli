'use client';

import { SPACING_RESTING, SPACING_STORY_GRID } from '@/components/ds/ui/spacing-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadSpacingStory: LoadDotStory = async (stage) => {
	const { createSpacingStoryPlayer } = await import('@/components/ds/ui/spacing-story-player');
	return createSpacingStoryPlayer(stage);
};

/**
 * The "Spacing and depth" card's picture: two blocks open to each step of the spacing scale, then a card is lifted
 * by each of the site's shadows. With reduced motion it shows the card at its highest.
 */
export function SpacingStory({ className }: { className?: string }) {
	return <DotStory grid={SPACING_STORY_GRID} resting={SPACING_RESTING} load={loadSpacingStory} className={className} />;
}
