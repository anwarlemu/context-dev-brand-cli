"use client";

import { DotStory, type LoadDotStory } from "@/components/visuals/glyph/dot-story";
import { cellStates } from "@/components/visuals/glyph/dot-story-cells";
import { GLYPH_GRID } from "@/components/visuals/glyph/glyph-art";
import { GIFT_CELLS } from "@/components/visuals/glyph/upgrade-story-art";
import { FINE_GRID, fineCellsOf } from "@/components/visuals/glyph/upgrade-story-fine";

const RESTING = { cells: fineCellsOf(cellStates(GLYPH_GRID, GIFT_CELLS)) };

const load: LoadDotStory = async (stage) => {
  const { createUpgradeStoryPlayer } = await import("@/components/visuals/glyph/upgrade-story-player");
  return createUpgradeStoryPlayer(stage);
};

/** The upgrade card's picture: a gift that takes off as a rocket, on a loop while on screen. Reduced motion keeps the gift. */
export function UpgradeGlyph({ className }: { className?: string }) {
  return <DotStory grid={FINE_GRID} resting={RESTING} load={load} className={className} />;
}
