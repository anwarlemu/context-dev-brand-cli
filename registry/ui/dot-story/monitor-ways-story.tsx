'use client';

import { EXTRACT_MONITOR_RESTING, MONITOR_WAYS_GRID, PAGE_MONITOR_RESTING, SITEMAP_MONITOR_RESTING } from '@/components/ds/ui/monitor-ways-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadPlayers = () => import('@/components/ds/ui/monitor-ways-story-player');
const loadPageMonitorStory: LoadDotStory = async (stage) => (await loadPlayers()).createPageMonitorStoryPlayer(stage);
const loadSitemapMonitorStory: LoadDotStory = async (stage) => (await loadPlayers()).createSitemapMonitorStoryPlayer(stage);
const loadExtractMonitorStory: LoadDotStory = async (stage) => (await loadPlayers()).createExtractMonitorStoryPlayer(stage);

/** A page monitor's picture: a page re-scraped until a line changes, then that line's diff. With reduced motion it shows the diff. */
export function PageMonitorStory({ className }: { className?: string }) {
	return <DotStory grid={MONITOR_WAYS_GRID} resting={PAGE_MONITOR_RESTING} load={loadPageMonitorStory} className={className} />;
}

/** A sitemap monitor's picture: a list of URLs loses one and gains one, then the new page. With reduced motion it shows the changed list. */
export function SitemapMonitorStory({ className }: { className?: string }) {
	return <DotStory grid={MONITOR_WAYS_GRID} resting={SITEMAP_MONITOR_RESTING} load={loadSitemapMonitorStory} className={className} />;
}

/** An extract monitor's picture: a plain-language instruction, then the record read from the page and its confidence. With reduced motion it shows the scored record. */
export function ExtractMonitorStory({ className }: { className?: string }) {
	return <DotStory grid={MONITOR_WAYS_GRID} resting={EXTRACT_MONITOR_RESTING} load={loadExtractMonitorStory} className={className} />;
}
