'use client';

import { STRUCTURE_RESTING, STRUCTURE_STORY_GRID } from '@/components/visuals/stories/structure-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadStructureStory: LoadDotStory = async (stage) => {
	const { createStructureStoryPlayer } = await import('@/components/visuals/stories/structure-story-player');
	return createStructureStoryPlayer(stage);
};

/**
 * The "Choose the structure" card's picture: a paragraph of prose becomes a tree of named fields, which fill with
 * the answer's values. With reduced motion it shows the fields filled.
 */
export function StructureStory({ className }: { className?: string }) {
	return <DotStory grid={STRUCTURE_STORY_GRID} resting={STRUCTURE_RESTING} load={loadStructureStory} className={className} />;
}
