import { COVER_GRID, createCoverShader, parseCoverDots } from "@/components/visuals/glyph/cover-dot-shader";
import { pagesScene } from "@/components/visuals/glyph/cover-scenes";
import type { DotPalette } from "@/components/visuals/dot-engine/dot-morph-dots";
import { createDotMorphPlayer, type DotMorphFrame, type DotMorphPlayer } from "@/components/visuals/dot-engine/dot-morph-player";
import { PAGES_COVER_SVG } from "@/components/visuals/glyph/pages-cover-art";

// Bolder dots than the website's covers (radius 3.4, ring 1.6), so the art reads as solid brand blue at card size like the
// glyphs beside it. The cover art is drawn to match, so the resting art and the live morph line up.
const DASHBOARD_COVER_GRID = { ...COVER_GRID, dotRadius: 3.8, ringStroke: 2 };

interface CoverMorphOptions {
  canvas: HTMLCanvasElement;
  palette: DotPalette;
  onPlayingChange: (isPlaying: boolean) => void;
  onFrame?: (frame: DotMorphFrame) => void;
}

/** The website's "pages" blog cover, live: it rests on the generated art and plays the scene's morph from there. */
export function createPagesCoverMorph({ canvas, palette, onPlayingChange, onFrame }: CoverMorphOptions): DotMorphPlayer {
  return createDotMorphPlayer({
    canvas,
    palette,
    onPlayingChange,
    onFrame,
    source: {
      grid: DASHBOARD_COVER_GRID,
      fit: "contain",
      restingDots: parseCoverDots(PAGES_COVER_SVG),
      spinSpeed: pagesScene.spinSpeed,
      spinPeriod: pagesScene.spinPeriod,
      sample: createCoverShader(pagesScene),
    },
  });
}
