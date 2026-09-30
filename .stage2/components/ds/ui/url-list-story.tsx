'use client';

import { URL_LIST_RESTING, URL_LIST_STORY_GRID } from '@/components/ds/ui/url-list-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadUrlListStory: LoadDotStory = async (stage) => {
	const { createUrlListStoryPlayer } = await import('@/components/ds/ui/url-list-story-player');
	return createUrlListStoryPlayer(stage);
};

/**
 * The "Massive URL lists" card's picture: a list of URLs runs up to the batch limit, then one of them is shown with
 * the identifier and metadata it carries. With reduced motion it shows that URL.
 */
export function UrlListStory({ className }: { className?: string }) {
	return <DotStory grid={URL_LIST_STORY_GRID} resting={URL_LIST_RESTING} load={loadUrlListStory} className={className} />;
}
