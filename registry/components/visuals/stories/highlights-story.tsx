'use client';

import { HIGHLIGHTS_RESTING, HIGHLIGHTS_STORY_GRID } from '@/components/visuals/stories/highlights-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadHighlightsStory: LoadDotStory = async (stage) => {
	const { createHighlightsStoryPlayer } = await import('@/components/visuals/stories/highlights-story-player');
	return createHighlightsStoryPlayer(stage);
};

export function HighlightsStory({ className }: { className?: string }) {
	return <DotStory grid={HIGHLIGHTS_STORY_GRID} resting={HIGHLIGHTS_RESTING} load={loadHighlightsStory} className={className} />;
}
