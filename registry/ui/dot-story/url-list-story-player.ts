import { captionedBeat } from '@/components/ds/ui/story-caption';
import { BATCH_LIMIT, CAPTIONS, ENTRY_TAGGED, ENTRY_UNTAGGED, LIST_AT_REST, LIST_REPEATS_EVERY, TAG_COUNT, URL_LIST_STORY_GRID, paintEntry, paintList } from '@/components/ds/ui/url-list-story-scenes';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One submission, played as a loop: a list of URLs runs up its sheet while the count climbs to the batch limit;
 * the list melts into one of its URLs up close, and the identifier and metadata it carries are set on it.
 */

// The list runs a whole number of repeats, so it stops looking exactly as it arrived.
const RUN = { startsAt: 0.3, seconds: 2.7, repeats: 2 };
const TAGGING = { startsAt: 0.7, everySeconds: 0.5 };
const COUNT_STEP = 250;

const ranAt = (heldSeconds: number) => clamp01((heldSeconds - RUN.startsAt) / RUN.seconds);

export function createUrlListStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const [label, count, detail] = CAPTIONS.list;
	return createBeatStoryPlayer(stage, {
		grid: URL_LIST_STORY_GRID,
		resting: { beat: 1, heldSeconds: TAGGING.startsAt + TAG_COUNT * TAGGING.everySeconds + 0.6 },
		beats: [
			{
				...captionedBeat({ picture: LIST_AT_REST, caption: CAPTIONS.list, holdSeconds: RUN.startsAt + RUN.seconds + 0.9, animate: (states, heldSeconds) => void paintList(states, ranAt(heldSeconds) * RUN.repeats * LIST_REPEATS_EVERY) }),
				write(pen, heldSeconds) {
					pen.text(label);
					pen.text({ ...count, text: (Math.round((ranAt(heldSeconds) * BATCH_LIMIT) / COUNT_STEP) * COUNT_STEP).toLocaleString('en-US') });
					pen.text(detail);
				},
			},
			captionedBeat({
				picture: ENTRY_UNTAGGED,
				departure: ENTRY_TAGGED,
				caption: CAPTIONS.entry,
				holdSeconds: TAGGING.startsAt + TAG_COUNT * TAGGING.everySeconds + 2.2,
				isTyped: true,
				animate: (states, heldSeconds) => void paintEntry(states, heldSeconds < TAGGING.startsAt ? 0 : Math.min(TAG_COUNT, Math.floor((heldSeconds - TAGGING.startsAt) / TAGGING.everySeconds) + 1)),
			}),
		],
	});
}
