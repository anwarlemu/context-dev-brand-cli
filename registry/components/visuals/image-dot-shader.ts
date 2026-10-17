// The brand kit's dot shader (the website's image-dot-shader.ts, itself the kit's scripts/blog-cover-art/dot-shader.mjs),
// run on any image: the picture is fitted into an 80 by 60 grid, each cell's coverage and tone are read back and every
// cell becomes a solid dot, a hollow dot or nothing. The grid, dot sizes and thresholds match the kit, so a shaded
// picture sits beside the official artwork. Everything here is pure except `shadeImage`, which reads pixels through a
// canvas in the browser.

export const SHADER_WIDTH = 800;
export const SHADER_HEIGHT = 600;
export const SHADER_PITCH = 10;
export const SHADER_COLUMNS = SHADER_WIDTH / SHADER_PITCH;
export const SHADER_ROWS = SHADER_HEIGHT / SHADER_PITCH;
export const SHADER_DOT_RADIUS = 3.4;
export const SHADER_RING_STROKE = 1.6;
const SUPERSAMPLE = 4;
const SUBJECT_SCALE = 0.84;

const TONE_AMOUNT = 0.75;
const CONTRAST = 2.2;
const DITHER = 0.22;
const TEXTURE = 0.12;
const FILLED_AT = 0.55;
const HOLLOW_AT = 0.16;
const MIN_COVERAGE = 0.08;

const BACKGROUND_TOLERANCE = 0.06;
const BACKGROUND_FEATHER = 0.1;
const OPAQUE_EDGE = 0.9;

export const DOT_ABSENT = 0;
export const DOT_HOLLOW = 1;
export const DOT_FILLED = 2;

/** One state per grid cell, row by row: DOT_ABSENT, DOT_HOLLOW or DOT_FILLED. */
export type DotStates = Uint8Array;

/** The three brand surfaces a shaded picture is drawn on. */
export type DotShaderSurface = "white" | "blue" | "black";

/** Each surface's colors as brand tokens. Inline SVG takes them as they are; `resolveSurfaceColors` turns them into
 *  plain values for a downloaded file. */
export const DOT_SHADER_SURFACES: Record<DotShaderSurface, { background: string; dots: string; ringOpacity: number }> = {
  white: { background: "var(--ds-color-white)", dots: "var(--ds-color-brand)", ringOpacity: 0.14 },
  blue: { background: "var(--ds-color-brand)", dots: "var(--ds-color-white)", ringOpacity: 0.22 },
  black: { background: "var(--ds-color-black)", dots: "var(--ds-color-white)", ringOpacity: 0.22 },
};

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((value) => (value + 0.5) / 16);
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const srgbToLinear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

function hashNoise(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const sx = (x - x0) ** 2 * (3 - 2 * (x - x0));
  const sy = (y - y0) ** 2 * (3 - 2 * (y - y0));
  const top = hashNoise(x0, y0) + (hashNoise(x0 + 1, y0) - hashNoise(x0, y0)) * sx;
  const bottom = hashNoise(x0, y0 + 1) + (hashNoise(x0 + 1, y0 + 1) - hashNoise(x0, y0 + 1)) * sx;
  return top + (bottom - top) * sy;
}

function classify(column: number, row: number, coverage: number, darkness: number) {
  if (coverage < MIN_COVERAGE) return DOT_ABSENT;
  const contrasted = clamp01((darkness - 0.5) * CONTRAST + 0.5);
  const texture = (smoothNoise(column / 3.2, row / 3.2) - 0.5) * TEXTURE;
  let value = Math.sqrt(coverage) * (1 - TONE_AMOUNT * (1 - clamp01(contrasted + texture)));
  value += (BAYER[(row & 3) * 4 + (column & 3)] - 0.5) * DITHER * 0.5;
  if (value >= FILLED_AT) return DOT_FILLED;
  return value >= HOLLOW_AT ? DOT_HOLLOW : DOT_ABSENT;
}

/** Where the picture sits inside the sampling field, in field pixels. */
export interface ShaderRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The sampling field: SUPERSAMPLE pixels a side per grid cell. */
export const SHADER_FIELD_WIDTH = SHADER_COLUMNS * SUPERSAMPLE;
export const SHADER_FIELD_HEIGHT = SHADER_ROWS * SUPERSAMPLE;

/** Fits an image of this size into the field, centered and scaled down a little so the subject has room around it. */
export function shaderRegion(imageWidth: number, imageHeight: number): ShaderRegion {
  const scale = Math.min(SHADER_FIELD_WIDTH / imageWidth, SHADER_FIELD_HEIGHT / imageHeight) * SUBJECT_SCALE;
  const width = Math.max(1, Math.round(imageWidth * scale));
  const height = Math.max(1, Math.round(imageHeight * scale));
  return { x: Math.round((SHADER_FIELD_WIDTH - width) / 2), y: Math.round((SHADER_FIELD_HEIGHT - height) / 2), width, height };
}

function edgeOffsets(region: ShaderRegion) {
  const offsets: number[] = [];
  const right = region.x + region.width - 1;
  const bottom = region.y + region.height - 1;
  for (let x = region.x; x <= right; x++) offsets.push((region.y * SHADER_FIELD_WIDTH + x) * 4, (bottom * SHADER_FIELD_WIDTH + x) * 4);
  for (let y = region.y; y <= bottom; y++) offsets.push((y * SHADER_FIELD_WIDTH + region.x) * 4, (y * SHADER_FIELD_WIDTH + right) * 4);
  return offsets;
}

// Photos and screenshots have no transparency, so the color along their edges is taken as the backdrop and keyed out;
// otherwise the whole rectangle would come back as one block of dots.
function keyOutOpaqueBackdrop(pixels: Uint8ClampedArray, region: ShaderRegion) {
  const edges = edgeOffsets(region);
  const edgeAlpha = edges.reduce((sum, offset) => sum + pixels[offset + 3], 0) / (edges.length * 255);
  if (edgeAlpha < OPAQUE_EDGE) return;

  const backdrop = [0, 1, 2].map((channel) => edges.reduce((sum, offset) => sum + pixels[offset + channel], 0) / edges.length);
  for (let y = region.y; y < region.y + region.height; y++) {
    for (let x = region.x; x < region.x + region.width; x++) {
      const offset = (y * SHADER_FIELD_WIDTH + x) * 4;
      const distance = Math.hypot(pixels[offset] - backdrop[0], pixels[offset + 1] - backdrop[1], pixels[offset + 2] - backdrop[2]) / (255 * Math.sqrt(3));
      pixels[offset + 3] *= clamp01((distance - BACKGROUND_TOLERANCE) / BACKGROUND_FEATHER);
    }
  }
}

/**
 * The shader itself, pure: RGBA pixels of the whole field (SHADER_FIELD_WIDTH by SHADER_FIELD_HEIGHT, the picture
 * drawn into `region`) in, one dot state per grid cell out. The pixels are modified (an opaque backdrop is keyed out).
 */
export function shadePixels(pixels: Uint8ClampedArray, region: ShaderRegion): DotStates {
  keyOutOpaqueBackdrop(pixels, region);
  const states = new Uint8Array(SHADER_COLUMNS * SHADER_ROWS);
  for (let row = 0; row < SHADER_ROWS; row++) {
    for (let column = 0; column < SHADER_COLUMNS; column++) {
      let coverage = 0;
      let darkness = 0;
      for (let dy = 0; dy < SUPERSAMPLE; dy++) {
        for (let dx = 0; dx < SUPERSAMPLE; dx++) {
          const offset = ((row * SUPERSAMPLE + dy) * SHADER_FIELD_WIDTH + column * SUPERSAMPLE + dx) * 4;
          const alpha = pixels[offset + 3] / 255;
          if (alpha === 0) continue;
          const lightness = Math.cbrt(0.2126 * srgbToLinear(pixels[offset]) + 0.7152 * srgbToLinear(pixels[offset + 1]) + 0.0722 * srgbToLinear(pixels[offset + 2]));
          coverage += alpha;
          darkness += alpha * (1 - lightness);
        }
      }
      states[row * SHADER_COLUMNS + column] = classify(column, row, coverage / SUPERSAMPLE ** 2, coverage > 0 ? darkness / coverage : 0);
    }
  }
  return states;
}

/** Shades a loaded image in the browser. A remote image must allow CORS, or the canvas cannot be read. */
export function shadeImage(image: CanvasImageSource, imageWidth: number, imageHeight: number): DotStates {
  const region = shaderRegion(imageWidth, imageHeight);
  const canvas = document.createElement("canvas");
  canvas.width = SHADER_FIELD_WIDTH;
  canvas.height = SHADER_FIELD_HEIGHT;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable");
  context.drawImage(image, region.x, region.y, region.width, region.height);
  return shadePixels(context.getImageData(0, 0, SHADER_FIELD_WIDTH, SHADER_FIELD_HEIGHT).data, region);
}

/** Loads an image (with CORS) and decodes it, ready for `shadeImage`. */
export async function loadShaderImage(src: string) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  await image.decode();
  return image;
}

/** Loads and shades an image in one step. */
export async function shadeImageSrc(src: string): Promise<DotStates> {
  const image = await loadShaderImage(src);
  return shadeImage(image, image.naturalWidth || SHADER_WIDTH, image.naturalHeight || SHADER_HEIGHT);
}

export function countDots(states: DotStates) {
  return states.reduce((count, state) => count + (state === DOT_ABSENT ? 0 : 1), 0);
}

/**
 * Reads an SVG the shader (or the brand kit) wrote back into dot states: its `filled` and `hollow` paths hold one
 * command per run of neighboring dots. Returns all-absent states for an SVG without them.
 */
export function parseShadedDots(svg: string): DotStates {
  const states = new Uint8Array(SHADER_COLUMNS * SHADER_ROWS);
  for (const [id, state] of [
    ["filled", DOT_FILLED],
    ["hollow", DOT_HOLLOW],
  ] as const) {
    const runs = new RegExp(`id="${id}"[^>]* d="([^"]*)"`).exec(svg)?.[1] ?? "";
    for (const run of runs.matchAll(/M([\d.]+) ([\d.]+)h([\d.]+)/g)) {
      const first = Math.floor(Number(run[2]) / SHADER_PITCH) * SHADER_COLUMNS + Math.floor(Number(run[1]) / SHADER_PITCH);
      states.fill(state, first, first + Math.floor(Number(run[3]) / SHADER_PITCH) + 1);
    }
  }
  return states;
}

// Neighboring dots in a row become one dashed line with a round cap per dot, which keeps the SVG small. Browsers drop a
// dash that starts exactly at its line's end, so each run overshoots by a hair to keep its last dot.
const RUN_OVERSHOOT = 0.01;
function dotRuns(states: DotStates, wanted: number) {
  let path = "";
  for (let row = 0; row < SHADER_ROWS; row++) {
    for (let column = 0; column < SHADER_COLUMNS; column++) {
      if (states[row * SHADER_COLUMNS + column] !== wanted) continue;
      let end = column;
      while (end + 1 < SHADER_COLUMNS && states[row * SHADER_COLUMNS + end + 1] === wanted) end++;
      path += `M${column * SHADER_PITCH + SHADER_PITCH / 2} ${row * SHADER_PITCH + SHADER_PITCH / 2}h${(end - column) * SHADER_PITCH + RUN_OVERSHOOT}`;
      column = end;
    }
  }
  return path;
}

export const SHADER_BACKDROP_RING_STROKE = 2;
export const SHADER_HALO_RADIUS = 16;
const BACKDROP_PITCH = 30;
const BACKDROP_RING_RADIUS = 7.5;

function backdropRings() {
  const firstCenter = (length: number) => (length - Math.floor(length / BACKDROP_PITCH) * BACKDROP_PITCH + BACKDROP_PITCH) / 2;
  const r = BACKDROP_RING_RADIUS;
  let path = "";
  for (let cy = firstCenter(SHADER_HEIGHT); cy < SHADER_HEIGHT; cy += BACKDROP_PITCH) {
    for (let cx = firstCenter(SHADER_WIDTH); cx < SHADER_WIDTH; cx += BACKDROP_PITCH) path += `M${cx + r} ${cy}a${r} ${r} 0 1 0 ${-2 * r} 0a${r} ${r} 0 1 0 ${2 * r} 0`;
  }
  return path;
}

/** The faint ring backdrop every shaded picture sits on; the same for every picture. */
export const SHADER_BACKDROP_PATH = backdropRings();

/**
 * The path data of a shaded picture's layers, for drawing it inline: `halo` is the background color painted through
 * every dot grown into a blob so the backdrop rings clear away from the art; `filled` and `hollow` are dashed runs
 * (stroke-dasharray `0 SHADER_PITCH`, round caps) drawn at SHADER_DOT_RADIUS, hollow ones masked to a ring.
 */
export function dotLayers(states: DotStates) {
  const filled = dotRuns(states, DOT_FILLED);
  const hollow = dotRuns(states, DOT_HOLLOW);
  return { backdrop: SHADER_BACKDROP_PATH, halo: filled + hollow, filled, hollow };
}

/**
 * The picture as a standalone SVG file: faint rings, the halo, then the art. Pass plain colors (from
 * `resolveSurfaceColors`) for a file that is used outside the page.
 */
export function dotsSvg(states: DotStates, { background, dots, ringOpacity }: { background: string; dots: string; ringOpacity: number }) {
  const { backdrop, halo, filled, hollow } = dotLayers(states);
  const dash = `stroke-dasharray="0 ${SHADER_PITCH}"`;
  const W = SHADER_WIDTH;
  const H = SHADER_HEIGHT;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" stroke="${dots}" stroke-linecap="round">`,
    `<rect width="${W}" height="${H}" fill="${background}" stroke="none"/>`,
    `<path stroke-width="${SHADER_BACKDROP_RING_STROKE}" stroke-opacity="${ringOpacity}" d="${backdrop}"/>`,
    `<path stroke="${background}" stroke-width="${SHADER_HALO_RADIUS * 2}" d="${halo}"/>`,
    `<defs><path id="hollow" ${dash} d="${hollow}"/><mask id="rings" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#FFFFFF" stroke="none"/><use href="#hollow" stroke="#000000" stroke-width="${(SHADER_DOT_RADIUS - SHADER_RING_STROKE) * 2}"/></mask></defs>`,
    `<path id="filled" stroke-width="${SHADER_DOT_RADIUS * 2}" ${dash} d="${filled}"/>`,
    `<use href="#hollow" stroke-width="${SHADER_DOT_RADIUS * 2}" mask="url(#rings)"/>`,
    "</svg>\n",
  ].join("");
}

const toHex = (rgb: string) => {
  const channels = rgb.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length < 3) return rgb;
  return `#${channels.map((n) => Math.round(n).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
};

/** A surface's token colors as hex, read from the page (inside `within`, so a scoped theme applies). */
export function resolveSurfaceColors(surface: DotShaderSurface, within: Element = document.body) {
  const palette = DOT_SHADER_SURFACES[surface];
  const probe = document.createElement("span");
  probe.style.display = "none";
  within.append(probe);
  const read = (token: string) => {
    probe.style.color = token;
    return toHex(getComputedStyle(probe).color);
  };
  const colors = { background: read(palette.background), dots: read(palette.dots), ringOpacity: palette.ringOpacity };
  probe.remove();
  return colors;
}
