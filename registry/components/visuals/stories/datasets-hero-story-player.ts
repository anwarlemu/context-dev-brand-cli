import { DATASETS_CAPTIONS, DATASET_EMPTY, DATASET_FILLED, RECORD_COUNT, SOURCES_COLLECTED, SOURCES_UNREAD, SOURCE_COUNT, paintDataset, paintSources } from '@/components/visuals/stories/datasets-hero-story-scenes';
import { HERO_STORY_GRID, stepAt } from '@/components/visuals/stories/hero-story-kit';
import { captionedBeat } from '@/components/visuals/dot-engine/story-caption';
import { createBeatStoryPlayer } from '@/components/visuals/dot-engine/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

/**
 * One project, played as a loop: the source documents are collected one at a time, then melt into the dataset
 * they are delivered as, its records filling in row by row.
 */

const COLLECTING = { startsAt: 0.6, everySeconds: 0.6 };
const COLLECTED_AT = COLLECTING.startsAt + (SOURCE_COUNT - 1) * COLLECTING.everySeconds;
const FILLING = { startsAt: 0.5, everySeconds: 0.3 };
const FILLED_AT = FILLING.startsAt + (RECORD_COUNT - 1) * FILLING.everySeconds;

export function createDatasetsHeroStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: HERO_STORY_GRID,
		resting: { beat: 1, heldSeconds: FILLED_AT + 0.8 },
		beats: [
			captionedBeat({
				picture: SOURCES_UNREAD,
				departure: SOURCES_COLLECTED,
				caption: DATASETS_CAPTIONS.sources,
				holdSeconds: COLLECTED_AT + 1.8,
				isTyped: true,
				animate: (states, heldSeconds) => void paintSources(states, stepAt(heldSeconds, COLLECTING, SOURCE_COUNT - 1) + 1),
			}),
			captionedBeat({
				picture: DATASET_EMPTY,
				departure: DATASET_FILLED,
				caption: DATASETS_CAPTIONS.dataset,
				holdSeconds: FILLED_AT + 2,
				isTyped: true,
				animate: (states, heldSeconds) => void paintDataset(states, stepAt(heldSeconds, FILLING, RECORD_COUNT - 1) + 1),
			}),
		],
	});
}
