'use client';

import { SCOPE_RESTING, SCOPE_STORY_GRID } from '@/components/ds/ui/scope-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadScopeStory: LoadDotStory = async (stage) => {
	const { createScopeStoryPlayer } = await import('@/components/ds/ui/scope-story-player');
	return createScopeStoryPlayer(stage);
};

/**
 * The "Scope the discovery" card's picture: a domain takes in its subdomains, then becomes a meter that fills with
 * links and stops at the limit. With reduced motion it shows the meter at its limit.
 */
export function ScopeStory({ className }: { className?: string }) {
	return <DotStory grid={SCOPE_STORY_GRID} resting={SCOPE_RESTING} load={loadScopeStory} className={className} />;
}
