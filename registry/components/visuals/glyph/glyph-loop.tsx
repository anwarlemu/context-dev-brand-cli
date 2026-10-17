"use client";

import { useCallback, useMemo } from "react";
import { DotStory, type LoadDotStory } from "@/components/visuals/glyph/dot-story";
import { GLYPH_GRID, glyphSubject, type GlyphPairName } from "@/components/visuals/glyph/glyph-art";

type GlyphLoopProps = {
  name: GlyphPairName;
  /** The color repainted around the dots; defaults to the surface token. */
  surfaceColor?: string;
  /** How far into the subject's hold this loop starts, so neighbors don't change in step. */
  startsAtSeconds?: number;
  className?: string;
};

/**
 * A page's picture in the brand dot grid: its subject sweeps into what it gives you and back, while on screen.
 * Reduced motion keeps the subject.
 */
export function GlyphLoop({ name, surfaceColor, startsAtSeconds = 0, className }: GlyphLoopProps) {
  const resting = useMemo(() => ({ cells: glyphSubject(name) }), [name]);
  const load = useCallback<LoadDotStory>(
    async (stage) => {
      const { createGlyphLoopPlayer } = await import("@/components/visuals/glyph/glyph-loop-player");
      return createGlyphLoopPlayer(stage, name, startsAtSeconds);
    },
    [name, startsAtSeconds],
  );
  return <DotStory grid={GLYPH_GRID} resting={resting} load={load} surfaceColor={surfaceColor} className={className} />;
}
