'use client';

import { WATCH_RESTING, WATCH_STORY_GRID } from '@/components/visuals/stories/watch-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadWatchStory: LoadDotStory = async (stage) => {
	const { createWatchStoryPlayer } = await import('@/components/visuals/stories/watch-story-player');
	return createWatchStoryPlayer(stage);
};

/**
 * The Monitor card's picture: a clock checks the page on its schedule until a check finds a change, then becomes a
 * bell that rings beside the notice of what changed. With reduced motion it shows the bell and its notice.
 */
export function WatchStory({ className }: { className?: string }) {
	return <DotStory grid={WATCH_STORY_GRID} resting={WATCH_RESTING} load={loadWatchStory} className={className} />;
}
