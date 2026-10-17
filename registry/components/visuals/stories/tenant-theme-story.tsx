'use client';

import { TENANT_THEME_RESTING, TENANT_THEME_GRID } from '@/components/visuals/stories/tenant-theme-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadTenantThemeStory: LoadDotStory = async (stage) => {
	const { createTenantThemeStoryPlayer } = await import('@/components/visuals/stories/tenant-theme-story-player');
	return createTenantThemeStoryPlayer(stage);
};

/**
 * The theming page's picture: one dashboard re-themed for three tenants in turn, each brand spreading across it from
 * the mark in its sidebar. With reduced motion it shows the first tenant's.
 */
export function TenantThemeStory({ className }: { className?: string }) {
	return <DotStory grid={TENANT_THEME_GRID} resting={TENANT_THEME_RESTING} load={loadTenantThemeStory} className={className} />;
}
