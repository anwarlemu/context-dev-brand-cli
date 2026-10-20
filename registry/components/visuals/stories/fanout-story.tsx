'use client';

import { FANOUT_RESTING, FANOUT_STORY_GRID } from '@/components/visuals/stories/fanout-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadFanoutStory: LoadDotStory = async (stage) => {
	const { createFanoutStoryPlayer } = await import('@/components/visuals/stories/fanout-story-player');
	return createFanoutStoryPlayer(stage);
};

export function FanoutStory({ className }: { className?: string }) {
	return <DotStory grid={FANOUT_STORY_GRID} resting={FANOUT_RESTING} load={loadFanoutStory} className={className} />;
}
