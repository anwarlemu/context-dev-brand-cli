import type { DotMorphFrame } from "@/components/visuals/dot-engine/dot-morph-player";

/**
 * The "pages" blog cover's hover choreography, ported from context-website (agencidev/landing-page):
 * src/components/sections/home/blog-cover-scenes.ts. At `morph` 0 it draws the shaded illustration behind
 * public/blog-covers/pages.svg (keep the two in step), and by `morph` 1 the three pages have bound into one. `spin` keeps
 * the big page's lines writing while it holds.
 *
 * Shapes on the goo layer are blurred and re-cut by the dot shader, so they melt into each other as they meet; the crisp
 * layer is for line work that must survive that.
 */

type Context = CanvasRenderingContext2D;

export interface CoverLayers {
  goo: Context;
  crisp: Context;
}

export interface CoverScene {
  spinSpeed: number;
  spinPeriod: number;
  /** Blur, in cover units, that fuses the goo layer's shapes. */
  gooSigma: (morph: number) => number;
  draw: (layers: CoverLayers, frame: DotMorphFrame) => void;
}

const TAU = Math.PI * 2;
const CENTER_X = 400;
const CENTER_Y = 300;

// The scene is drawn on an offscreen raster that the dot shader reads back as coverage and tone; it is never shown, so
// its black, white and grays are shading amounts (black a filled dot, white a ring), not colors.
const shade = (level: number) => "rgb(" + [level, level, level].join(" ") + ")";
const PAGE_LIT = "white";
const PAGE_SHADED = shade(208);
const INK = "black";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const phase = (morph: number, start: number, end: number) => clamp01((morph - start) / (end - start));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
const swell = (morph: number, start: number, end: number) => Math.sin(Math.PI * phase(morph, start, end));

function linearFill(context: Context, x0: number, y0: number, x1: number, y1: number, from: string, to: string) {
  const gradient = context.createLinearGradient(x0, y0, x1, y1);
  gradient.addColorStop(0, from);
  gradient.addColorStop(1, to);
  return gradient;
}

interface TextLine {
  y: number;
  width: number;
  height: number;
}

function drawPage(context: Context, width: number, height: number, border: number, inset: number, lines: TextLine[]) {
  const left = -width / 2;
  const top = -height / 2;
  context.fillStyle = linearFill(context, left, top, -left, -top, PAGE_LIT, PAGE_SHADED);
  context.fillRect(left, top, width, height);
  context.fillStyle = INK;
  for (const line of lines) context.fillRect(left + inset, top + line.y, line.width, line.height);
  context.strokeStyle = INK;
  context.lineWidth = border;
  context.strokeRect(left, top, width, height);
}

const smallPageLines = (widths: number[]): TextLine[] => widths.map((width, index) => ({ y: 40 + index * 40, width, height: 20 }));

const SMALL_PAGES = [
  { x: 163, y: 310, rotate: -5, lines: smallPageLines([96, 114, 78, 108, 88]) },
  { x: 400, y: 285, rotate: 0, lines: smallPageLines([114, 82, 114, 100, 70]) },
  { x: 637, y: 310, rotate: 5, lines: smallPageLines([104, 80, 114, 74, 100]) },
];

const BIG_PAGE_LINES: TextLine[] = [
  { y: 48, width: 150, height: 30 },
  { y: 110, width: 230, height: 20 },
  { y: 152, width: 196, height: 20 },
  { y: 194, width: 230, height: 20 },
  { y: 236, width: 168, height: 20 },
  { y: 278, width: 214, height: 20 },
  { y: 320, width: 186, height: 20 },
  { y: 362, width: 120, height: 20 },
];

// The outer pages stop this far short of the center, so the three fuse into one wide mass rather than a single stack.
const GATHERED_SPREAD = 0.3;

/** Three pages gather and bind into one big page whose lines keep writing while the card stays hovered. */
export const pagesScene: CoverScene = {
  spinSpeed: 1.5,
  spinPeriod: TAU,
  gooSigma: (morph) => 18 * swell(morph, 0.05, 0.95),
  draw({ goo }, { morph, spin }) {
    const gather = easeInOut(phase(morph, 0, 0.6));
    const bind = easeInOut(phase(morph, 0.3, 0.75));

    goo.globalAlpha = 1 - bind;
    for (const page of SMALL_PAGES) {
      goo.save();
      goo.translate(lerp(page.x, lerp(CENTER_X, page.x, GATHERED_SPREAD), gather), lerp(page.y, CENTER_Y, gather));
      goo.rotate((lerp(page.rotate, 0, gather) * Math.PI) / 180);
      drawPage(goo, 170, 250, 12, 28, page.lines);
      goo.restore();
    }

    const writing = easeInOut(phase(morph, 0.8, 1));
    const size = lerp(0.6, 1, easeOutBack(phase(morph, 0.35, 0.95)));
    goo.globalAlpha = bind;
    goo.save();
    goo.translate(CENTER_X, CENTER_Y);
    goo.scale(size, size);
    drawPage(
      goo,
      310,
      430,
      14,
      40,
      BIG_PAGE_LINES.map((line, index) => (index === 0 ? line : { ...line, width: line.width * (1 + 0.14 * writing * Math.sin(spin + index * 1.3)) })),
    );
    goo.restore();
    goo.globalAlpha = 1;
  },
};
