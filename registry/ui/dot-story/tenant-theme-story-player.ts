import { TENANT_THEMES, TENANT_THEME_GRID, THEME_ORIGIN } from '@/components/ds/ui/tenant-theme-story-scenes';
import { createBeatStoryPlayer, typingSeconds } from '@/components/ds/ui/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One codebase, played as a loop over three tenants: each tenant's domain is typed under the dashboard, and its brand
 * spreads across the same layout in a wave from the mark in the sidebar.
 */

const WAVE_SECONDS = 1.2;
const TYPING = { startsAt: 0.1, charactersPerSecond: 12 };
const THEMED_HOLD_SECONDS = 2.2;

export function createTenantThemeStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: TENANT_THEME_GRID,
		resting: { beat: 0, heldSeconds: TYPING.startsAt + typingSeconds(TENANT_THEMES[0].domain, TYPING.charactersPerSecond) + 1 },
		beats: TENANT_THEMES.map(({ picture, domain }) => ({
			picture,
			arrival: { kind: 'waves', seconds: WAVE_SECONDS, origin: THEME_ORIGIN },
			holdSeconds: TYPING.startsAt + typingSeconds(domain, TYPING.charactersPerSecond) + THEMED_HOLD_SECONDS,
			write: (pen, heldSeconds) => pen.type(domain, heldSeconds, { ...TYPING, cursorLingers: 0.6 }),
		})),
	});
}
