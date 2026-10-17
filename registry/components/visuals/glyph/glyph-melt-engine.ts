import { createGlyphShader, drawGlyphCells, glyphRestingDots, type GlyphMorph } from "@/components/visuals/dot-engine/dot-glyph-morph";
import type { DotPalette } from "@/components/visuals/dot-engine/dot-morph-dots";
import { createDotMorphPlayer, type DotMorphPlayer } from "@/components/visuals/dot-engine/dot-morph-player";
import { GLYPH_GRID, GLYPH_MELT_MARGIN, glyphOutcome, glyphSubject, type GlyphPairName } from "@/components/visuals/glyph/glyph-art";
import { GLYPH_HOLDS } from "@/components/visuals/glyph/glyph-melt-holds";

/**
 * The blog covers' hover melt, played on a page glyph: its subject blurs and re-cuts into what it gives you, then
 * eases back when let go. A pair with a hold keeps moving while the card stays hovered. The grid reaches a few cells
 * past the glyph, so the melt can spill over its edge.
 */

// The covers' melt blurs a cell and a half, which thins a glyph's one-dot lines to nothing halfway through; a lighter
// blur, keeping any dot the melt even a fifth covers, carries the picture across without ever emptying it.
const GOO_SIGMA_IN_CELLS = 0.6;
const PRESENT_AT = 0.2;

const GLYPH_MELT_GRID = { ...GLYPH_GRID, columns: GLYPH_GRID.columns + GLYPH_MELT_MARGIN * 2, rows: GLYPH_GRID.rows + GLYPH_MELT_MARGIN * 2 };

interface GlyphMeltOptions {
  canvas: HTMLCanvasElement;
  name: GlyphPairName;
  palette: DotPalette;
  onPlayingChange: (isPlaying: boolean) => void;
}

export function createGlyphMelt({ canvas, name, palette, onPlayingChange }: GlyphMeltOptions): DotMorphPlayer {
  const outcome = glyphOutcome(name);
  const hold = GLYPH_HOLDS[name];
  const morph: GlyphMorph = {
    grid: GLYPH_MELT_GRID,
    box: { left: GLYPH_MELT_MARGIN, top: GLYPH_MELT_MARGIN, cellsPerSide: GLYPH_GRID.columns },
    cells: glyphSubject(name),
    drawTarget: (context, { spin }) => (hold ? hold.draw(context, spin) : drawGlyphCells(context, outcome, GLYPH_GRID.pitch)),
    gooSigmaInCells: GOO_SIGMA_IN_CELLS,
    presentAt: PRESENT_AT,
  };

  return createDotMorphPlayer({
    canvas,
    palette,
    onPlayingChange,
    source: {
      grid: GLYPH_MELT_GRID,
      fit: "contain",
      restingDots: glyphRestingDots(morph),
      // Without a hold nothing keeps moving once the outcome has arrived, so there is no spin to rewind.
      spinSpeed: hold?.spinSpeed ?? 0,
      spinPeriod: hold?.spinPeriod ?? Math.PI * 2,
      sample: createGlyphShader(morph),
    },
  });
}
