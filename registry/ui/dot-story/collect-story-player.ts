import { CAPTIONS, COLLECT_STORY_GRID, PAGES_SHOWN, PROGRESS_DONE, PROGRESS_EMPTY, RESULTS_FIRST_PAGE, RESULTS_LAST_PAGE, WEBHOOK_PLANE, paintProgress, paintResults } from '@/components/ds/ui/collect-story-scenes';
import { captionedBeat } from '@/components/ds/ui/story-caption';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One job's collection, played as a loop: a ring fills as the job runs to completion, melts into the results,
 * turned a page at a time, and those melt into the paper plane of the webhook that says the job is done.
 */

const RUNNING = { startsAt: 0.3, seconds: 2 };
const PAGING = { startsAt: 0.9, everySeconds: 0.8 };

const doneAt = (heldSeconds: number) => clamp01((heldSeconds - RUNNING.startsAt) / RUNNING.seconds);
const pageAt = (heldSeconds: number) => (heldSeconds < PAGING.startsAt ? 0 : Math.min(PAGES_SHOWN - 1, Math.floor((heldSeconds - PAGING.startsAt) / PAGING.everySeconds) + 1));

export function createCollectStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const [statusLabel, percent, status] = CAPTIONS.progress;
	const [resultsLabel, page, pageDetail] = CAPTIONS.results;
	return createBeatStoryPlayer(stage, {
		grid: COLLECT_STORY_GRID,
		resting: { beat: 0, heldSeconds: RUNNING.startsAt + RUNNING.seconds + 0.6 },
		beats: [
			{
				...captionedBeat({ picture: PROGRESS_EMPTY, departure: PROGRESS_DONE, caption: CAPTIONS.progress, holdSeconds: RUNNING.startsAt + RUNNING.seconds + 1.2, animate: (states, heldSeconds) => void paintProgress(states, doneAt(heldSeconds)) }),
				write(pen, heldSeconds) {
					const done = doneAt(heldSeconds);
					pen.text(statusLabel);
					pen.text({ ...percent, text: `${Math.round(done * 100)}%` });
					pen.text({ ...status, text: done < 1 ? 'running' : 'completed' });
				},
			},
			{
				...captionedBeat({ picture: RESULTS_FIRST_PAGE, departure: RESULTS_LAST_PAGE, caption: CAPTIONS.results, holdSeconds: PAGING.startsAt + (PAGES_SHOWN - 1) * PAGING.everySeconds + 0.8, animate: (states, heldSeconds) => void paintResults(states, pageAt(heldSeconds)) }),
				write(pen, heldSeconds) {
					pen.text(resultsLabel);
					pen.text({ ...page, text: `page ${pageAt(heldSeconds) + 1}` });
					pen.text(pageDetail);
				},
			},
			captionedBeat({ picture: WEBHOOK_PLANE, caption: CAPTIONS.webhook, holdSeconds: 2.4, isTyped: true }),
		],
	});
}
