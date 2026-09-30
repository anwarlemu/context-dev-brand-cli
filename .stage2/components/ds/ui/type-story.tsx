'use client';

import { TYPE_RESTING, TYPE_STORY_GRID } from '@/components/ds/ui/type-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadTypeStory: LoadDotStory = async (stage) => {
	const { createTypeStoryPlayer } = await import('@/components/ds/ui/type-story-player');
	return createTypeStoryPlayer(stage);
};

/**
 * The "Colors and typography" card's picture: a type specimen set from light to bold, then the site's colors read
 * one chip at a time. With reduced motion it shows the bold specimen.
 */
export function TypeStory({ className }: { className?: string }) {
	return <DotStory grid={TYPE_STORY_GRID} resting={TYPE_RESTING} load={loadTypeStory} className={className} />;
}
