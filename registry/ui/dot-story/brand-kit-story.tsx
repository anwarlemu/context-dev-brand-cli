'use client';

import { BRAND_KIT_RESTING, BRAND_KIT_GRID } from '@/components/ds/ui/brand-kit-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadBrandKitStory: LoadDotStory = async (stage) => {
	const { createBrandKitStoryPlayer } = await import('@/components/ds/ui/brand-kit-story-player');
	return createBrandKitStoryPlayer(stage);
};

/**
 * The Brand kit page's picture: a typed domain becomes a kit box, then the logo, colors, typeface and company details
 * unpacked from it. With reduced motion it shows the unpacked kit.
 */
export function BrandKitStory({ className }: { className?: string }) {
	return <DotStory grid={BRAND_KIT_GRID} resting={BRAND_KIT_RESTING} load={loadBrandKitStory} className={className} />;
}
