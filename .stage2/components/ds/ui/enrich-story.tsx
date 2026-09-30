'use client';

import { ENRICH_RESTING, ENRICH_STORY_GRID } from '@/components/ds/ui/enrich-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadEnrichStory: LoadDotStory = async (stage) => {
	const { createEnrichStoryPlayer } = await import('@/components/ds/ui/enrich-story-player');
	return createEnrichStoryPlayer(stage);
};

/**
 * The "Enrich any entity your agent sees" card's picture: the agent's eye reads an identifier and melts into the
 * company and the person behind it, each with its profile. With reduced motion it shows both profiles, linked.
 */
export function EnrichStory({ className }: { className?: string }) {
	return <DotStory grid={ENRICH_STORY_GRID} resting={ENRICH_RESTING} load={loadEnrichStory} className={className} />;
}
