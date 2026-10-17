import { FINDING_COUNT, FREE_TOOLS_CAPTIONS, SHELF_LIT, SHELF_UNLIT, TILE_COUNT, TOOL_DONE, TOOL_WAITING, paintShelf, paintTool } from '@/components/visuals/stories/free-tools-hero-story-scenes';
import { HERO_STORY_GRID, stepAt } from '@/components/visuals/stories/hero-story-kit';
import { captionedBeat } from '@/components/visuals/dot-engine/story-caption';
import { createBeatStoryPlayer } from '@/components/visuals/dot-engine/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

/**
 * The free tools, played as a loop: the shelf lights up a tool at a time, then melts into one tool with a URL in
 * its field, and its results come in line by line.
 */

const LIGHTING = { startsAt: 0.4, everySeconds: 0.16 };
const LIT_AT = LIGHTING.startsAt + (TILE_COUNT - 1) * LIGHTING.everySeconds;
const FINDING = { startsAt: 0.9, everySeconds: 0.35 };
const FOUND_AT = FINDING.startsAt + (FINDING_COUNT - 1) * FINDING.everySeconds;

export function createFreeToolsHeroStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: HERO_STORY_GRID,
		resting: { beat: 1, heldSeconds: FOUND_AT + 0.8 },
		beats: [
			captionedBeat({
				picture: SHELF_UNLIT,
				departure: SHELF_LIT,
				caption: FREE_TOOLS_CAPTIONS.shelf,
				holdSeconds: LIT_AT + 1.6,
				isTyped: true,
				animate: (states, heldSeconds) => void paintShelf(states, stepAt(heldSeconds, LIGHTING, TILE_COUNT - 1) + 1),
			}),
			captionedBeat({
				picture: TOOL_WAITING,
				departure: TOOL_DONE,
				caption: FREE_TOOLS_CAPTIONS.tool,
				holdSeconds: FOUND_AT + 2,
				isTyped: true,
				animate: (states, heldSeconds) => void paintTool(states, stepAt(heldSeconds, FINDING, FINDING_COUNT - 1) + 1),
			}),
		],
	});
}
