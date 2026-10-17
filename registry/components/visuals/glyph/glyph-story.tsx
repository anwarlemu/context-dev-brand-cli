"use client";

import { useMemo } from "react";
import { DotStory, type LoadDotStory } from "@/components/visuals/dot-engine/dot-story";
import { cellStates } from "@/components/visuals/dot-engine/dot-story-cells";
import { GLYPH_GRID, glyphSubject, type GlyphPairName } from "@/components/visuals/glyph/glyph-art";
import { FINE_GRID, fineCellsOf } from "@/components/visuals/glyph/upgrade-story-fine";

/**
 * A glyph pair drawn in the blog covers' fine dot pattern, like the Browse APIs and Upgrade plan cards: brand-blue dots
 * on the page, the subject melting into what it gives you on a loop while in view. `still` holds the subject instead,
 * as reduced motion does.
 */
export function GlyphStory({ name, still = false, className }: { name: GlyphPairName; still?: boolean; className?: string }) {
  const resting = useMemo(() => ({ cells: fineCellsOf(cellStates(GLYPH_GRID, glyphSubject(name))) }), [name]);
  const load = useMemo<LoadDotStory>(
    () => async (stage) => {
      const { createGlyphStoryPlayer } = await import("@/components/visuals/glyph/glyph-story-player");
      return createGlyphStoryPlayer(stage, name);
    },
    [name],
  );
  return <DotStory grid={FINE_GRID} resting={resting} load={load} still={still} className={className} />;
}
