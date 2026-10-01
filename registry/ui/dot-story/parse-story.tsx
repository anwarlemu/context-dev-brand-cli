'use client';

import { PARSE_RESTING, PARSE_STORY_GRID } from '@/components/ds/ui/parse-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadParseStory: LoadDotStory = async (stage) => {
	const { createParseStoryPlayer } = await import('@/components/ds/ui/parse-story-player');
	return createParseStoryPlayer(stage);
};

/**
 * The Parse File card's picture: an uploaded PDF is read by OCR and becomes a Markdown document. With reduced
 * motion it shows the Markdown.
 */
export function ParseStory({ className }: { className?: string }) {
	return <DotStory grid={PARSE_STORY_GRID} resting={PARSE_RESTING} load={loadParseStory} className={className} />;
}
