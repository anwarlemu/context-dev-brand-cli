import { glyphCellsFromRows } from "@/components/visuals/glyph/dot-glyph-cells";

/** The upgrade story's pictures: a gift, then the rocket it takes off as. */

export const GIFT_CELLS = glyphCellsFromRows([
  " ###   ### ",
  "#   # #   #",
  " ### # ### ",
  "###########",
  "#####o#####",
  "###########",
  " ####o#### ",
  " ####o#### ",
  " ####o#### ",
  " ####o#### ",
  " ####o#### ",
]);

export const ROCKET_CELLS = glyphCellsFromRows([
  "     #     ",
  "    ###    ",
  "   #####   ",
  "   ## ##   ",
  "   #####   ",
  "   #####   ",
  "  #######  ",
  " ## ### ## ",
  "##  ###  ##",
  "#   # #   #",
  "     #     ",
]);
