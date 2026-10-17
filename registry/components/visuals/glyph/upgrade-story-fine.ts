import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from "@/components/visuals/dot-engine/dot-morph-dots";
import { cellsOfStates } from "@/components/visuals/dot-engine/dot-story-cells";
import { GLYPH_GRID } from "@/components/visuals/glyph/glyph-art";

/**
 * The upgrade story drawn in the blog covers' fine dot pattern, like the Browse APIs card beside it: every dot of the
 * 11 × 11 glyph becomes a 4 × 4 block of small dots. A solid dot's block is mostly filled with a scatter of rings, as
 * the covers shade a solid surface; a ring's block is all rings.
 */

const SCALE = 4;

export const FINE_GRID: DotGrid = {
  columns: GLYPH_GRID.columns * SCALE,
  rows: GLYPH_GRID.rows * SCALE,
  pitch: 10,
  dotRadius: 3.8,
  ringStroke: 2,
  haloRadius: 0,
};

// Which small dots of a solid block are rings: one in four, staggered row to row so they read as texture, not stripes.
const isRingInSolid = (column: number, row: number) => (column + 2 * row) % 4 === 0;

/** A glyph-grid picture's states at the fine grid's size. */
export function fineStates(coarse: Uint8Array): Uint8Array {
  const fine = new Uint8Array(FINE_GRID.columns * FINE_GRID.rows);
  for (let row = 0; row < GLYPH_GRID.rows; row++) {
    for (let column = 0; column < GLYPH_GRID.columns; column++) {
      const state = coarse[row * GLYPH_GRID.columns + column];
      if (state === DOT_ABSENT) continue;
      for (let dy = 0; dy < SCALE; dy++) {
        for (let dx = 0; dx < SCALE; dx++) {
          const fineColumn = column * SCALE + dx;
          const fineRow = row * SCALE + dy;
          fine[fineRow * FINE_GRID.columns + fineColumn] = state === DOT_FILLED && !isRingInSolid(fineColumn, fineRow) ? DOT_FILLED : DOT_HOLLOW;
        }
      }
    }
  }
  return fine;
}

export const fineCellsOf = (coarse: Uint8Array) => cellsOfStates(FINE_GRID, fineStates(coarse));
