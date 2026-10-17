'use client';

import { BLOG_RESTING } from '@/components/visuals/stories/blog-hero-story-scenes';
import { HERO_STORY_GRID } from '@/components/visuals/stories/hero-story-kit';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadBlogHeroStory: LoadDotStory = async (stage) => {
	const { createBlogHeroStoryPlayer } = await import('@/components/visuals/stories/blog-hero-story-player');
	return createBlogHeroStoryPlayer(stage);
};

/**
 * The blog hero's picture: a post writes itself line by line, then becomes a megaphone calling out the news. With
 * reduced motion it shows the written post.
 */
export function BlogHeroStory({ className }: { className?: string }) {
	return <DotStory grid={HERO_STORY_GRID} resting={BLOG_RESTING} load={loadBlogHeroStory} className={className} />;
}
