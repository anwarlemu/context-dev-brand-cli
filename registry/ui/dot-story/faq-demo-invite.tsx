'use client';

import { FAQ_DEMO_RESTING, FAQ_DEMO_STORY_GRID } from '@/components/ds/ui/faq-demo-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';
import { HeroCirclePatternSurface } from '@/components/ds/ui/hero-circle-pattern';
import { HERO_PATTERN_HOLE_ATTRIBUTE } from '@/components/ds/ui/hero-pattern-hole';
import { cx as cn } from '@/components/ds/ui/cx';

const loadFaqDemoStory: LoadDotStory = async (stage) => {
	const { createFaqDemoStoryPlayer } = await import('@/components/ds/ui/faq-demo-story-player');
	return createFaqDemoStoryPlayer(stage);
};

/**
 * The picture under the FAQ intro. On the brand's ring pattern, a banner asks for questions and becomes a paper plane
 * that flies from the bottom left off to the top right. With reduced motion it shows the banner.
 */
export function FaqDemoInvite({ className }: { className?: string }) {
	return (
		<HeroCirclePatternSurface tone="subtle" clusters={false} className={cn('select-none', className)}>
			<div aria-hidden="true" {...{ [HERO_PATTERN_HOLE_ATTRIBUTE]: 'cover' }} className="relative block">
				<DotStory grid={FAQ_DEMO_STORY_GRID} resting={FAQ_DEMO_RESTING} load={loadFaqDemoStory} />
			</div>
		</HeroCirclePatternSurface>
	);
}
