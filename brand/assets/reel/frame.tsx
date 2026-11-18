/*
 * The reel's camera and wall, from agd-playground src/components/context-reel/Reel.tsx (the frame only: no clock, no
 * controls; the video command asks for each frame by time).
 *
 *   0.00  the blue cover fills the frame; the mark assembles
 *   1.35  the camera pulls back: the cover is one tile of a wall
 *   2.35  three columns scroll, every tile running its own loop
 *   6.35  the camera pushes into Web, Scrape, Markdown
 *   8.40  cut to the end card
 *  10.00  end
 */

import type React from "react";
import { easeInOutQuint, hash, lerp, span } from "./motion";
import { TILES, type TileName } from "./registry";
import { EndCard } from "./tiles";

export const DURATION = 10;
const FPS = 60;

/* The wall: three columns of 16:9 tiles with a 28px gutter. */
const G = 28;
const W = (1920 - 4 * G) / 3;
const H = (W * 9) / 16;
const PITCH = H + G;
const TILE_SCALE = W / 1920;
const RADIUS = 14 / TILE_SCALE;

type Column = {
  x: number;
  dir: 1 | -1;
  v: number;
  offset: number;
  tiles: TileName[];
};
const COLUMNS: Column[] = [
  {
    x: G,
    dir: -1,
    v: 90,
    offset: PITCH * 0.5,
    tiles: ["markdown", "stat", "twoCards", "tagline", "bench", "pipeline"],
  },
  {
    x: G * 2 + W,
    dir: 1,
    v: 105,
    offset: 0,
    tiles: ["cover", "testimonial", "pipeline", "markdown"],
  },
  {
    x: G * 3 + W * 2,
    dir: -1,
    v: 80,
    offset: -PITCH * 0.3,
    tiles: ["bench", "twoCards", "testimonial", "stat", "tagline", "coverDark"],
  },
];

const OUT: [number, number] = [1.35, 2.35];
const IN: [number, number] = [6.35, 7.3];
const END = 8.4;

/* The two tiles the camera visits, as column and instance. */
const COVER = { c: 1, k: 0 };
const HERO = { c: 1, k: -2 };

const centreY = (c: number, k: number, t: number) => {
  const col = COLUMNS[c];
  return 540 + k * PITCH + col.dir * col.v * t + col.offset;
};
const tileOf = (c: number, k: number): TileName => {
  const list = COLUMNS[c].tiles;
  return list[((k % list.length) + list.length) % list.length];
};

/* Each tile's own clock. The two the camera visits are timed to be caught
   at their best; the rest are simply out of step with one another. */
function localTime(c: number, k: number, t: number) {
  if (c === COVER.c && k === COVER.k) return t;
  if (c === HERO.c && k === HERO.k) return (t - 6.9) * 1.6;
  return t + hash(c * 97 + k * 13) * 4;
}

function camera(t: number) {
  let e = 0;
  let target = COVER;
  if (t < OUT[0]) e = 1;
  else if (t < OUT[1]) e = 1 - easeInOutQuint(span(t, OUT[0], OUT[1]));
  else if (t < IN[0]) e = 0;
  else {
    target = HERO;
    e = easeInOutQuint(span(t, IN[0], IN[1]));
  }
  const cx = COLUMNS[target.c].x + W / 2;
  const cy = centreY(target.c, target.k, t);
  const scale = Math.pow(1920 / W, e);
  return {
    e,
    target,
    scale,
    /* The wall point that lands on the middle of the screen. */
    cx,
    cy,
    sx: lerp(cx, 960, e),
    sy: lerp(cy, 540, e),
  };
}

export function Frame({ t }: { t: number }) {
  if (t >= END) return <EndCard lt={t - END} />;
  const cam = camera(t);
  const tiles: React.ReactNode[] = [];
  COLUMNS.forEach((col, c) => {
    /* Only the instances anywhere near the frame. */
    const k0 =
      Math.floor((-PITCH - (540 + col.dir * col.v * t + col.offset)) / PITCH) -
      1;
    const k1 =
      Math.ceil(
        (1080 + PITCH - (540 + col.dir * col.v * t + col.offset)) / PITCH,
      ) + 1;
    for (let k = k0; k <= k1; k++) {
      const name = tileOf(c, k);
      const Tile = TILES[name];
      const y = centreY(c, k, t) - H / 2;
      const isTarget = c === cam.target.c && k === cam.target.k;
      const radius = isTarget ? RADIUS * (1 - cam.e) : RADIUS;
      tiles.push(
        <div
          key={`${c}:${k}`}
          className="cx-tile"
          style={{
            transform: `translate(${col.x}px, ${y}px) scale(${TILE_SCALE})`,
            borderRadius: radius,
          }}
        >
          <Tile lt={localTime(c, k, t)} />
        </div>,
      );
    }
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: "0 0",
        transform: `translate(${cam.sx}px, ${cam.sy}px) scale(${cam.scale}) translate(${-cam.cx}px, ${-cam.cy}px)`,
      }}
    >
      {tiles}
    </div>
  );
}

