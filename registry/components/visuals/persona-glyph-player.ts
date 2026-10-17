import { createBeatStoryPlayer, type StoryPicture } from "@/components/visuals/dot-engine/dot-story-beats";
import { cellStates, cellsOfStates } from "@/components/visuals/dot-engine/dot-story-cells";
import type { DotStoryPlayer, DotStoryStage } from "@/components/visuals/dot-engine/dot-story-player";
import type { GlyphCell } from "@/components/visuals/dot-engine/dot-glyph-cells";
import { PERSONA_GLYPH_GRID, personaGlyph, personaOutcome, type PersonaGlyphName } from "@/components/visuals/stories/persona-glyphs";

/** A persona's glyph, played as a loop: what the team builds gives way to what the API gives it, and back. */

// A glyph this small is mostly one-dot lines, which a melt thins to nothing halfway through; a wave from the
// middle swaps one glyph for the other without ever emptying the card.
const WAVE = { seconds: 0.8, origin: { column: 5, row: 5 } };
const OUTCOME_HOLD_SECONDS = 2.2;
const GLYPH_HOLD_SECONDS = 2.8;

const pictureOfCells = (cells: GlyphCell[]): StoryPicture => {
  const states = cellStates(PERSONA_GLYPH_GRID, cells);
  return { states, cells: cellsOfStates(PERSONA_GLYPH_GRID, states) };
};

/** `startsAtSeconds` into the glyph's hold is where this card joins the loop, so a grid of cards does not melt in step. */
export function createPersonaGlyphPlayer(stage: DotStoryStage, name: PersonaGlyphName, startsAtSeconds: number): DotStoryPlayer {
  return createBeatStoryPlayer(stage, {
    grid: PERSONA_GLYPH_GRID,
    resting: { beat: 1, heldSeconds: startsAtSeconds % GLYPH_HOLD_SECONDS },
    beats: [
      { picture: pictureOfCells(personaOutcome(name)), arrival: { kind: "waves", ...WAVE }, holdSeconds: OUTCOME_HOLD_SECONDS },
      { picture: pictureOfCells(personaGlyph(name)), arrival: { kind: "waves", ...WAVE }, holdSeconds: GLYPH_HOLD_SECONDS },
    ],
  });
}
