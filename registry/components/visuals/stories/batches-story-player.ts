import { BATCH_SIZE, BATCHES_STORY_GRID, COUNTER, EMPTY_PROGRESS, FULL_PROGRESS, PROGRESS_CELLS, SOURCES, SOURCES_LABEL } from '@/components/visuals/stories/batches-story-scenes';
import { DOT_FILLED } from '@/components/visuals/dot-engine/dot-morph-dots';
import { createBeatStoryPlayer } from '@/components/visuals/dot-engine/dot-story-beats';
import { cellIndexIn, clamp01 } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

/**
 * One batch, played as a loop: its sources are read, then they melt into the job, which counts up to its URLs while
 * its progress fills dot by dot. The full progress melts back into the sources.
 */

const MELT = { kind: 'melts' as const, seconds: 1 };
const RUN = { startsAt: 0.3, seconds: 3 };
const cellIndex = cellIndexIn(BATCHES_STORY_GRID);
// Slows only a little toward the end, so the count is still visibly counting when it lands on the total.
const settle = (t: number) => 1 - (1 - t) ** 1.6;
const ran = (heldSeconds: number) => settle(clamp01((heldSeconds - RUN.startsAt) / RUN.seconds));

export function createBatchesStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: BATCHES_STORY_GRID,
		resting: { beat: 0, heldSeconds: 2 },
		beats: [
			{ picture: SOURCES, arrival: MELT, holdSeconds: 2.4, write: (pen) => pen.text(SOURCES_LABEL) },
			{
				picture: EMPTY_PROGRESS,
				arrival: MELT,
				holdSeconds: RUN.startsAt + RUN.seconds + 1.4,
				animate: (states, heldSeconds) => {
					const done = Math.round(ran(heldSeconds) * PROGRESS_CELLS.length);
					for (let step = 0; step < done; step++) states[cellIndex(PROGRESS_CELLS[step])] = DOT_FILLED;
				},
				departure: FULL_PROGRESS,
				write: (pen, heldSeconds) => pen.text({ ...COUNTER, text: `${Math.round(ran(heldSeconds) * BATCH_SIZE).toLocaleString('en-US')} URLs` }),
			},
		],
	});
}
