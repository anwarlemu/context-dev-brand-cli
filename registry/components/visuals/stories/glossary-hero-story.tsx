'use client';

import { GLOSSARY_RESTING } from '@/components/visuals/stories/glossary-hero-story-scenes';
import { HERO_STORY_GRID } from '@/components/visuals/stories/hero-story-kit';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadGlossaryHeroStory: LoadDotStory = async (stage) => {
	const { createGlossaryHeroStoryPlayer } = await import('@/components/visuals/stories/glossary-hero-story-player');
	return createGlossaryHeroStoryPlayer(stage);
};

/**
 * The glossary hero's picture: an open book read line by line, then one entry looked up term after term. With
 * reduced motion it shows the book.
 */
export function GlossaryHeroStory({ className }: { className?: string }) {
	return <DotStory grid={HERO_STORY_GRID} resting={GLOSSARY_RESTING} load={loadGlossaryHeroStory} className={className} />;
}
