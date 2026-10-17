'use client';

import { RAG_RESTING, RAG_STORY_GRID } from '@/components/visuals/stories/rag-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadRagStory: LoadDotStory = async (stage) => {
	const { createRagStoryPlayer } = await import('@/components/visuals/stories/rag-story-player');
	return createRagStoryPlayer(stage);
};

/**
 * The "Ground RAG in fresh content" card's picture: a question is typed into a search field, the field becomes a
 * brain, and the brain hands out the pages that answer it. With reduced motion it shows the brain with its pages.
 */
export function RagStory({ className }: { className?: string }) {
	return <DotStory grid={RAG_STORY_GRID} resting={RAG_RESTING} load={loadRagStory} className={className} />;
}
