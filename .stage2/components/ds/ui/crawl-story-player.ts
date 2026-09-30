import { CRAWL_STORY_GRID, DEPTH_CAPTIONS, MAX_DEPTH, SITEMAP, SITEMAP_CAPTION, WEB_SPUN, WEB_UNSPUN, paintWeb } from '@/components/ds/ui/crawl-story-scenes';
import { captionedBeat } from '@/components/ds/ui/story-caption';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One crawl, played as a loop: the sitemap it starts from melts into a web, and the web is spun outwards a ring of
 * links at a time, the depth counting up until it reaches the scope that was set.
 */

const SPINNING = { startsAt: 0.7, everySeconds: 0.8 };
const SPUN_AT = SPINNING.startsAt + (MAX_DEPTH - 1) * SPINNING.everySeconds;

const depthAt = (heldSeconds: number) => (heldSeconds < SPINNING.startsAt ? 0 : Math.min(MAX_DEPTH, Math.floor((heldSeconds - SPINNING.startsAt) / SPINNING.everySeconds) + 1));

export function createCrawlStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: CRAWL_STORY_GRID,
		resting: { beat: 1, heldSeconds: SPUN_AT + 1 },
		beats: [
			captionedBeat({ picture: SITEMAP, caption: SITEMAP_CAPTION, holdSeconds: 2.4, isTyped: true }),
			{
				...captionedBeat({ picture: WEB_UNSPUN, departure: WEB_SPUN, caption: DEPTH_CAPTIONS[0], holdSeconds: SPUN_AT + 2.8, animate: (states, heldSeconds) => void paintWeb(states, depthAt(heldSeconds)) }),
				write: (pen, heldSeconds) => DEPTH_CAPTIONS[depthAt(heldSeconds)].forEach((text) => pen.text(text)),
			},
		],
	});
}
