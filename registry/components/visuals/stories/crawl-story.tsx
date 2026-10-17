'use client';

import { CRAWL_RESTING, CRAWL_STORY_GRID } from '@/components/visuals/stories/crawl-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadCrawlStory: LoadDotStory = async (stage) => {
	const { createCrawlStoryPlayer } = await import('@/components/visuals/stories/crawl-story-player');
	return createCrawlStoryPlayer(stage);
};

/**
 * The "Full-site collection" card's picture: a sitemap becomes a web, spun outwards a ring of links at a time to
 * the scope that was set. With reduced motion it shows the whole web.
 */
export function CrawlStory({ className }: { className?: string }) {
	return <DotStory grid={CRAWL_STORY_GRID} resting={CRAWL_RESTING} load={loadCrawlStory} className={className} />;
}
