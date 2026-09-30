'use client';

import { RESEARCH_RESTING, RESEARCH_STORY_GRID } from '@/components/ds/ui/research-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadResearchStory: LoadDotStory = async (stage) => {
	const { createResearchStoryPlayer } = await import('@/components/ds/ui/research-story-player');
	return createResearchStoryPlayer(stage);
};

/**
 * The "Run deep research on demand" card's picture: a magnifying glass reads its way across a company's page, then
 * the page becomes the brand profile: typeface, colours, logo and facts. With reduced motion it shows the profile.
 */
export function ResearchStory({ className }: { className?: string }) {
	return <DotStory grid={RESEARCH_STORY_GRID} resting={RESEARCH_RESTING} load={loadResearchStory} className={className} />;
}
