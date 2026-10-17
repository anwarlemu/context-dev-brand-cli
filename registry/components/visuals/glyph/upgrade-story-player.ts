import type { GlyphCell } from "@/components/visuals/glyph/dot-glyph-cells";
import { createBeatStoryPlayer, type StoryPicture } from "@/components/visuals/glyph/dot-story-beats";
import { cellStates, cellsOfStates } from "@/components/visuals/glyph/dot-story-cells";
import type { DotStoryPlayer, DotStoryStage } from "@/components/visuals/glyph/dot-story-player";
import { GLYPH_GRID } from "@/components/visuals/glyph/glyph-art";
import { FINE_GRID, fineStates } from "@/components/visuals/glyph/upgrade-story-fine";
import { GIFT_CELLS, ROCKET_CELLS } from "@/components/visuals/glyph/upgrade-story-art";

const MELT = { kind: "melts" as const, seconds: 0.9 };

// Pictures are drawn on the glyph grid and played on the fine one (see upgrade-story-fine).
const pictureOfCells = (cells: GlyphCell[]): StoryPicture => {
  const states = fineStates(cellStates(GLYPH_GRID, cells));
  return { states, cells: cellsOfStates(FINE_GRID, states) };
};

/** A gift that becomes a rocket, which melts back into the gift. */
export function createUpgradeStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
  return createBeatStoryPlayer(stage, {
    grid: FINE_GRID,
    resting: { beat: 0, heldSeconds: 0 },
    beats: [
      { picture: pictureOfCells(GIFT_CELLS), arrival: MELT, holdSeconds: 1.6 },
      { picture: pictureOfCells(ROCKET_CELLS), arrival: MELT, holdSeconds: 2 },
    ],
  });
}
