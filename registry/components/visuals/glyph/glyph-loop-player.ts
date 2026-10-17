import type { GlyphCell } from "@/components/visuals/dot-engine/dot-glyph-cells";
import { createBeatStoryPlayer, type StoryPicture } from "@/components/visuals/dot-engine/dot-story-beats";
import { cellStates, cellsOfStates } from "@/components/visuals/dot-engine/dot-story-cells";
import type { DotStoryPlayer, DotStoryStage } from "@/components/visuals/dot-engine/dot-story-player";
import { GLYPH_GRID, glyphOutcome, glyphSubject, type GlyphPairName } from "@/components/visuals/glyph/glyph-art";

// A glyph this small is mostly one-dot lines, which a melt thins to nothing halfway through; a wave from the
// middle swaps one glyph for the other without ever emptying the picture.
const WAVE = { seconds: 0.8, origin: { column: 5, row: 5 } };
const OUTCOME_HOLD_SECONDS = 2.2;
const SUBJECT_HOLD_SECONDS = 2.8;

const pictureOfCells = (cells: GlyphCell[]): StoryPicture => {
  const states = cellStates(GLYPH_GRID, cells);
  return { states, cells: cellsOfStates(GLYPH_GRID, states) };
};

/** `startsAtSeconds` into the subject's hold is where this picture joins the loop, so neighbors don't melt in step. */
export function createGlyphLoopPlayer(stage: DotStoryStage, name: GlyphPairName, startsAtSeconds = 0): DotStoryPlayer {
  return createBeatStoryPlayer(stage, {
    grid: GLYPH_GRID,
    resting: { beat: 1, heldSeconds: startsAtSeconds % SUBJECT_HOLD_SECONDS },
    beats: [
      { picture: pictureOfCells(glyphOutcome(name)), arrival: { kind: "waves", ...WAVE }, holdSeconds: OUTCOME_HOLD_SECONDS },
      { picture: pictureOfCells(glyphSubject(name)), arrival: { kind: "waves", ...WAVE }, holdSeconds: SUBJECT_HOLD_SECONDS },
    ],
  });
}
