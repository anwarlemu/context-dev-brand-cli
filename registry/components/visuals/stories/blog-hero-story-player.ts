import { BLOG_CAPTIONS, LINE_COUNT, MEGAPHONE, POST_UNWRITTEN, POST_WRITTEN, paintPost } from '@/components/visuals/stories/blog-hero-story-scenes';
import { HERO_STORY_GRID } from '@/components/visuals/stories/hero-story-kit';
import { captionedBeat } from '@/components/visuals/dot-engine/story-caption';
import { createBeatStoryPlayer } from '@/components/visuals/dot-engine/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

/**
 * The blog, played as a loop: a post is written a line at a time, then melts into a megaphone whose sound waves
 * go out again and again.
 */

const WRITING = { startsAt: 0.5, linesPerSecond: 3 };
const WRITTEN_AT = WRITING.startsAt + LINE_COUNT / WRITING.linesPerSecond;
const CALLING = { everySeconds: 0.45, holdSeconds: 3.4, settlesFor: 0.6 };

const loudest = MEGAPHONE.length - 1;
// The megaphone ends its hold with every wave out, so the post melts in from the picture that was last on screen.
const wavesAt = (heldSeconds: number) => (heldSeconds > CALLING.holdSeconds - CALLING.settlesFor ? loudest : Math.floor(heldSeconds / CALLING.everySeconds) % MEGAPHONE.length);

export function createBlogHeroStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: HERO_STORY_GRID,
		resting: { beat: 0, heldSeconds: WRITTEN_AT + 0.8 },
		beats: [
			captionedBeat({
				picture: POST_UNWRITTEN,
				departure: POST_WRITTEN,
				caption: BLOG_CAPTIONS.guides,
				holdSeconds: WRITTEN_AT + 1.8,
				isTyped: true,
				animate: (states, heldSeconds) => void paintPost(states, Math.min(LINE_COUNT, Math.max(0, heldSeconds - WRITING.startsAt) * WRITING.linesPerSecond)),
			}),
			captionedBeat({
				picture: MEGAPHONE[0],
				departure: MEGAPHONE[loudest],
				caption: BLOG_CAPTIONS.news,
				holdSeconds: CALLING.holdSeconds,
				isTyped: true,
				animate: (states, heldSeconds) => states.set(MEGAPHONE[wavesAt(heldSeconds)].states),
			}),
		],
	});
}
