'use client';

import { METADATA_RESTING, METADATA_STORY_GRID } from '@/components/ds/ui/metadata-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadMetadataStory: LoadDotStory = async (stage) => {
	const { createMetadataStoryPlayer } = await import('@/components/ds/ui/metadata-story-player');
	return createMetadataStoryPlayer(stage);
};

/**
 * The "Use available metadata" card's picture: a tag becomes three mapped URLs, two of which gain their title and
 * description while the third waits. With reduced motion it shows the URLs as enriched as they get.
 */
export function MetadataStory({ className }: { className?: string }) {
	return <DotStory grid={METADATA_STORY_GRID} resting={METADATA_RESTING} load={loadMetadataStory} className={className} />;
}
