'use client';

import { IDENTITY_RESTING, IDENTITY_STORY_GRID } from '@/components/ds/ui/identity-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadIdentityStory: LoadDotStory = async (stage) => {
	const { createIdentityStoryPlayer } = await import('@/components/ds/ui/identity-story-player');
	return createIdentityStoryPlayer(stage);
};

/**
 * The "Resolve an identity" card's picture: a domain, an email, a name and a ticker melt into one another, then into
 * the seal of the brand they resolve to. With reduced motion it shows the seal.
 */
export function IdentityStory({ className }: { className?: string }) {
	return <DotStory grid={IDENTITY_STORY_GRID} resting={IDENTITY_RESTING} load={loadIdentityStory} className={className} />;
}
