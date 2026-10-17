import { glyphCellsFromRows } from "@/components/visuals/dot-engine/dot-glyph-cells";
import { drawGlyphCells } from "@/components/visuals/dot-engine/dot-glyph-morph";
import { GLYPH_GRID, type GlyphPairName } from "@/components/visuals/glyph/glyph-art";

/**
 * What keeps moving once a glyph has melted into its outcome, for as long as its card stays hovered, as the blog
 * covers' holds do. A hold draws the outcome itself, in grid units from the glyph box's top-left corner: black draws
 * filled dots, white hollow ones. Pairs without one simply rest on their outcome glyph.
 */

export interface GlyphHold {
  spinSpeed: number;
  /** The motion repeats every this many radians of spin. */
  spinPeriod: number;
  draw: (context: CanvasRenderingContext2D, spin: number) => void;
}

const TAU = Math.PI * 2;
const { pitch, columns } = GLYPH_GRID;
const CENTER = (columns * pitch) / 2;

const fillDisc = (context: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
  context.beginPath();
  context.arc(x, y, radius, 0, TAU);
  context.fill();
};

// A smaller globe than the outcome glyph's, so its orbits have room to swing round it inside the melt's margin.
const SMALL_GLOBE = glyphCellsFromRows(["  ###  ", " # # # ", "#  #  #", "#######", "#  #  #", " # # # ", "  ###  "]).map((cell) => ({
  ...cell,
  column: cell.column + 2,
  row: cell.row + 2,
}));
const ORBITS = 3;
const ORBIT_REACH = 66;
const ORBIT_DEPTH = 22;
const ORBIT_STROKE = 6;
// The orbits pass behind the globe: a ring this wide round it is cleared before the globe is drawn.
const GLOBE_CLEARANCE = 44;
const SATELLITE_RADIUS = 8;
// The orbits are a sixth of a turn apart, so the set looks the same each time it has turned that far.
const ORBIT_TURN_PER_SPIN = 1 / 6;

/** Three hollow orbits turn round a small globe, each carrying a satellite. */
const orbitingGlobe: GlyphHold = {
  spinSpeed: 3,
  spinPeriod: TAU,
  draw(context, spin) {
    const turn = spin * ORBIT_TURN_PER_SPIN;
    context.strokeStyle = "white";
    context.lineWidth = ORBIT_STROKE;
    for (let orbit = 0; orbit < ORBITS; orbit++) {
      context.beginPath();
      context.ellipse(CENTER, CENTER, ORBIT_REACH, ORBIT_DEPTH, turn + (orbit / ORBITS) * Math.PI, 0, TAU);
      context.stroke();
    }
    context.fillStyle = "black";
    for (let orbit = 0; orbit < ORBITS; orbit++) {
      const tilt = turn + (orbit / ORBITS) * Math.PI;
      const along = spin + (orbit / ORBITS) * TAU;
      const x = Math.cos(along) * ORBIT_REACH;
      const y = Math.sin(along) * ORBIT_DEPTH;
      fillDisc(context, CENTER + x * Math.cos(tilt) - y * Math.sin(tilt), CENTER + x * Math.sin(tilt) + y * Math.cos(tilt), SATELLITE_RADIUS);
    }
    context.globalCompositeOperation = "destination-out";
    fillDisc(context, CENTER, CENTER, GLOBE_CLEARANCE);
    context.globalCompositeOperation = "source-over";
    drawGlyphCells(context, SMALL_GLOBE, pitch);
  },
};

export const GLYPH_HOLDS: Partial<Record<GlyphPairName, GlyphHold>> = {
  dataApis: orbitingGlobe,
};
