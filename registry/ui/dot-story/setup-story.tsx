'use client';

import { CLOSED_ENVELOPE, SETUP_STORY_GRID } from '@/components/ds/ui/setup-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadSetupStory: LoadDotStory = async (stage) => {
	const { createSetupStoryPlayer } = await import('@/components/ds/ui/setup-story-player');
	return createSetupStoryPlayer(stage);
};

/**
 * The "Do it yourself" card's three steps as one looping picture: an envelope opens, becomes a terminal that types an
 * API key, then a package that is unpacked. With reduced motion it stays the closed envelope.
 */
export function SetupStory({ className }: { className?: string }) {
	return <DotStory grid={SETUP_STORY_GRID} resting={CLOSED_ENVELOPE} load={loadSetupStory} className={className} />;
}
