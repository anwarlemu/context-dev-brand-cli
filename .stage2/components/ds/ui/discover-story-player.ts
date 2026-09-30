import { DISCOVER_STORY_GRID, LIST_FILLED, LIST_READ, PAGES_FOUND, RADAR_AT_REST, RADAR_CAPTION, RADAR_SWEPT, SWEEPS, URL_TEXTS, paintRadar, readingOrder } from '@/components/ds/ui/discover-story-scenes';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One discovery, played as a loop: a radar sweeps the domain twice, a blip lighting for each page it finds while
 * the count climbs; the radar melts into a list, and the list clears one row at a time as each URL is written in.
 */

const MELT_SECONDS = 1.1;
const SWEEP = { startsAt: 0.3, seconds: 2.8 };
const READ = { seconds: 1.4, everySeconds: 0.25, textSeconds: 0.3 };
const DETAIL_FADE_SECONDS = 0.3;

const sweptAt = (heldSeconds: number) => clamp01((heldSeconds - SWEEP.startsAt) / SWEEP.seconds);

export function createDiscoverStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const [domain, count, detail] = RADAR_CAPTION;
	return createBeatStoryPlayer(stage, {
		grid: DISCOVER_STORY_GRID,
		resting: { beat: 2, heldSeconds: 2.4 },
		beats: [
			{
				picture: RADAR_AT_REST,
				departure: RADAR_SWEPT,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: SWEEP.startsAt + SWEEP.seconds + 0.9,
				animate: (states, heldSeconds) => void paintRadar(states, sweptAt(heldSeconds) * SWEEPS),
				write(pen, heldSeconds) {
					pen.text(domain);
					pen.text({ ...count, text: String(Math.round(sweptAt(heldSeconds) * PAGES_FOUND)) });
					pen.text(detail, clamp01((heldSeconds - SWEEP.startsAt) / DETAIL_FADE_SECONDS));
				},
			},
			{ picture: LIST_FILLED, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.2 },
			{
				picture: LIST_READ,
				arrival: { kind: 'builds', seconds: READ.seconds, order: readingOrder },
				holdSeconds: 3.4,
				write: (pen, heldSeconds) => URL_TEXTS.forEach((url, index) => pen.text(url, clamp01((heldSeconds - index * READ.everySeconds) / READ.textSeconds))),
			},
		],
	});
}
