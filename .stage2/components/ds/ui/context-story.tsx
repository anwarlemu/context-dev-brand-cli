'use client';

import { CONTEXT_RESTING, CONTEXT_STORY_GRID } from '@/components/ds/ui/context-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadContextStory: LoadDotStory = async (stage) => {
	const { createContextStoryPlayer } = await import('@/components/ds/ui/context-story-player');
	return createContextStoryPlayer(stage);
};

/**
 * The "Add company context" card's picture: a company's building becomes its social links, then a profile card
 * whose fields fill in. With reduced motion it shows the filled card.
 */
export function ContextStory({ className }: { className?: string }) {
	return <DotStory grid={CONTEXT_STORY_GRID} resting={CONTEXT_RESTING} load={loadContextStory} className={className} />;
}
