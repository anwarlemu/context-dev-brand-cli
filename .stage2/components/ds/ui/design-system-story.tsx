'use client';

import { DESIGN_SYSTEM_RESTING, DESIGN_SYSTEM_STORY_GRID } from '@/components/ds/ui/design-system-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadDesignSystemStory: LoadDotStory = async (stage) => {
	const { createDesignSystemStoryPlayer } = await import('@/components/ds/ui/design-system-story-player');
	return createDesignSystemStoryPlayer(stage);
};

/**
 * The Style guide page's picture: a live website is scanned and becomes its design system, a board of its type,
 * colors, buttons and spacing. With reduced motion it shows the board.
 */
export function DesignSystemStory({ className }: { className?: string }) {
	return <DotStory grid={DESIGN_SYSTEM_STORY_GRID} resting={DESIGN_SYSTEM_RESTING} load={loadDesignSystemStory} className={className} />;
}
