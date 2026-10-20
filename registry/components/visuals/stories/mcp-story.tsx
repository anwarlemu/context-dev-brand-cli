'use client';

import { MCP_RESTING, MCP_STORY_GRID } from '@/components/visuals/stories/mcp-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadMcpStory: LoadDotStory = async (stage) => {
	const { createMcpStoryPlayer } = await import('@/components/visuals/stories/mcp-story-player');
	return createMcpStoryPlayer(stage);
};

export function McpStory({ className }: { className?: string }) {
	return <DotStory grid={MCP_STORY_GRID} resting={MCP_RESTING} load={loadMcpStory} className={className} />;
}
