import { BOARD_LABELS, DESIGN_SYSTEM_STORY_GRID, SITE_URL, STYLE_BOARD, WEBSITE, paintScan } from '@/components/ds/ui/design-system-story-scenes';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One extraction, played as a loop: a scan runs down a live website twice, and the site melts into its design
 * system, a board whose quarters, type, color, buttons and spacing, are labelled one after another.
 */

const MELT_SECONDS = 1.1;
const SCAN = { startsAt: 0.4, seconds: 1.1, times: 2 };
const LABELLING = { startsAt: 0.2, everySeconds: 0.35, seconds: 0.3 };

export function createDesignSystemStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: DESIGN_SYSTEM_STORY_GRID,
		resting: { beat: 1, heldSeconds: 2.4 },
		beats: [
			{
				picture: WEBSITE,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: SCAN.startsAt + SCAN.seconds * SCAN.times + 0.4,
				animate(states, heldSeconds) {
					const scans = (heldSeconds - SCAN.startsAt) / SCAN.seconds;
					if (scans >= 0 && scans < SCAN.times) paintScan(states, scans % 1);
				},
				write: (pen) => pen.text(SITE_URL),
			},
			{
				picture: STYLE_BOARD,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: 4,
				write: (pen, heldSeconds) => BOARD_LABELS.forEach((text, index) => pen.text(text, clamp01((heldSeconds - LABELLING.startsAt - index * LABELLING.everySeconds) / LABELLING.seconds))),
			},
		],
	});
}
