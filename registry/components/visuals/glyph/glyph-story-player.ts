import { createBeatStoryPlayer, type StoryPicture } from "@/components/visuals/dot-engine/dot-story-beats";
import { cellStates, cellsOfStates } from "@/components/visuals/dot-engine/dot-story-cells";
import type { DotStoryPlayer, DotStoryStage } from "@/components/visuals/dot-engine/dot-story-player";
import { GLYPH_GRID, glyphOutcome, glyphSubject, type GlyphPairName } from "@/components/visuals/glyph/glyph-art";
import { FINE_GRID, fineStates } from "@/components/visuals/glyph/upgrade-story-fine";

const MELT = { kind: "melts" as const, seconds: 0.9 };

const pictureOf = (cells: ReturnType<typeof glyphSubject>): StoryPicture => {
  const states = fineStates(cellStates(GLYPH_GRID, cells));
  return { states, cells: cellsOfStates(FINE_GRID, states) };
};

/** A glyph pair told as the upgrade card tells its story: the subject melts into what it gives you, and back. */
export function createGlyphStoryPlayer(stage: DotStoryStage, name: GlyphPairName): DotStoryPlayer {
  return createBeatStoryPlayer(stage, {
    grid: FINE_GRID,
    resting: { beat: 0, heldSeconds: 0 },
    beats: [
      { picture: pictureOf(glyphSubject(name)), arrival: MELT, holdSeconds: 1.8 },
      { picture: pictureOf(glyphOutcome(name)), arrival: MELT, holdSeconds: 1.8 },
    ],
  });
}
