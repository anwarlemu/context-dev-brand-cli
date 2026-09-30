import { ASSETS_STORY_GRID, LOGO, LOGO_CAPTION, PALETTE, PROFILE_PICTURE, PROFILE_TEXTS, SWATCH_TEXTS } from '@/components/ds/ui/assets-story-scenes';
import { captionedBeat } from '@/components/ds/ui/story-caption';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One brand's assets, played as a loop: its logo melts into its colors, four swatches named one after another,
 * and the swatches melt into a company profile wearing both.
 */

const MELT_SECONDS = 1.1;
const NAMING = { startsAt: 0.2, everySeconds: 0.3, seconds: 0.3 };

export function createAssetsStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: ASSETS_STORY_GRID,
		resting: { beat: 2, heldSeconds: 2 },
		beats: [
			captionedBeat({ picture: LOGO, caption: LOGO_CAPTION, holdSeconds: 2.2 }),
			{
				picture: PALETTE,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: 2.8,
				write: (pen, heldSeconds) => SWATCH_TEXTS.forEach((texts, index) => texts.forEach((text) => pen.text(text, clamp01((heldSeconds - NAMING.startsAt - index * NAMING.everySeconds) / NAMING.seconds)))),
			},
			{ picture: PROFILE_PICTURE, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 3.2, write: (pen) => PROFILE_TEXTS.forEach((text) => pen.text(text)) },
		],
	});
}
