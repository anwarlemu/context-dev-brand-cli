'use client';

import { SCRAPE_RESTING, SCRAPE_STORY_GRID } from '@/components/ds/ui/scrape-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadScrapeStory: LoadDotStory = async (stage) => {
	const { createScrapeStoryPlayer } = await import('@/components/ds/ui/scrape-story-player');
	return createScrapeStoryPlayer(stage);
};

/**
 * The "Scrape anything" card's picture: a URL is typed, its Markdown streams out, and the page is captured as a
 * screenshot with its images lifted out. With reduced motion it shows everything delivered.
 */
export function ScrapeStory({ className }: { className?: string }) {
	return <DotStory grid={SCRAPE_STORY_GRID} resting={SCRAPE_RESTING} load={loadScrapeStory} className={className} />;
}
