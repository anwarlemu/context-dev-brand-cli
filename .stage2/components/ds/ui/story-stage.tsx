import { HeroCirclePatternSurface } from '@/components/ds/ui/hero-circle-pattern';
import { HERO_PATTERN_HOLE_ATTRIBUTE } from '@/components/ds/ui/hero-pattern-hole';
import type { ReactNode } from 'react';

/** Where a product card's dot story plays: the brand's ring pattern, keeping clear of the picture in its middle. */
export function StoryStage({ children }: { children: ReactNode }) {
	return (
		<HeroCirclePatternSurface tone="subtle" clusters={false} className="flex min-h-[22rem] flex-1 select-none items-center justify-center px-4 py-8 sm:px-9">
			<div {...{ [HERO_PATTERN_HOLE_ATTRIBUTE]: 'snug-box' }} className="relative w-full max-w-[26rem]">
				{children}
			</div>
		</HeroCirclePatternSurface>
	);
}
