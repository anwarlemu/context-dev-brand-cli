'use client';

import { SITE_MAP_RESTING, SITE_MAP_STORY_GRID } from '@/components/ds/ui/site-map-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadSiteMapStory: LoadDotStory = async (stage) => {
	const { createSiteMapStoryPlayer } = await import('@/components/ds/ui/site-map-story-player');
	return createSiteMapStoryPlayer(stage);
};

/**
 * The Map page's picture: a domain typed under a paper map becomes the site as a tree of its pages, and the pages to
 * scrape are picked. With reduced motion it shows the tree with its pages picked.
 */
export function SiteMapStory({ className }: { className?: string }) {
	return <DotStory grid={SITE_MAP_STORY_GRID} resting={SITE_MAP_RESTING} load={loadSiteMapStory} className={className} />;
}
