'use client';

import { ACTIONS_RESTING, ACTIONS_STORY_GRID } from '@/components/ds/ui/actions-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadActionsStory: LoadDotStory = async (stage) => {
	const { createActionsStoryPlayer } = await import('@/components/ds/ui/actions-story-player');
	return createActionsStoryPlayer(stage);
};

/**
 * The "Read dynamic pages" card's picture: a pointer clicks, an hourglass waits and a mouse scrolls, then the page
 * they leave behind renders. With reduced motion it shows the rendered page.
 */
export function ActionsStory({ className }: { className?: string }) {
	return <DotStory grid={ACTIONS_STORY_GRID} resting={ACTIONS_RESTING} load={loadActionsStory} className={className} />;
}
