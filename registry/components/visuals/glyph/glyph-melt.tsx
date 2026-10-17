"use client";

import { useCallback, useRef } from "react";
import { GLYPH_GRID, GLYPH_MELT_MARGIN, type GlyphPairName } from "@/components/visuals/glyph/glyph-art";
import { StillGlyph } from "@/components/visuals/glyph/glyph-tile";
import { resolveColor, SURFACE_COLOR } from "@/components/visuals/glyph/surface-color";
import { type LoadDotMorph, useHoverDotMorph } from "@/components/visuals/glyph/use-hover-dot-morph";
import { useResolvedTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type GlyphMeltProps = {
  name: GlyphPairName;
  /** The color repainted around the dots; defaults to the surface token. */
  surfaceColor?: string;
  className?: string;
};

const percent = (share: number) => `${share * 100}%`;
// The canvas reaches the melt's margin past the glyph on every side, so its dots land on the still glyph's.
const SPILL = GLYPH_MELT_MARGIN / GLYPH_GRID.columns;
const CANVAS_BOX = { left: percent(-SPILL), top: percent(-SPILL), width: percent(1 + SPILL * 2), height: percent(1 + SPILL * 2) };

/**
 * A page glyph that melts into what it gives you, as the blog covers do: on a loop while its card is in view, and
 * for as long as the card is hovered or keyboard-focused. The card is the nearest link, button or `data-hover-morph`.
 * At rest, and with reduced motion, it is the still glyph.
 */
export function GlyphMelt({ name, surfaceColor = SURFACE_COLOR, className }: GlyphMeltProps) {
  const theme = useResolvedTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const load = useCallback<LoadDotMorph>(
    async (canvas, onPlayingChange) => {
      const { createGlyphMelt } = await import("@/components/visuals/glyph/glyph-melt-engine");
      return createGlyphMelt({
        canvas,
        name,
        palette: { dots: getComputedStyle(canvas).color, background: resolveColor(canvas, surfaceColor) },
        onPlayingChange,
      });
    },
    // `theme` reloads the morph so it repaints in the new surface color.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, surfaceColor, theme],
  );
  const isPlaying = useHoverDotMorph(canvasRef, load, { playOnView: true });

  return (
    <span aria-hidden="true" className={cn("relative block text-brand", className)}>
      <StillGlyph name={name} className={cn("block w-full", isPlaying && "invisible")} />
      <canvas ref={canvasRef} className={cn("absolute", !isPlaying && "invisible")} style={CANVAS_BOX} />
    </span>
  );
}
