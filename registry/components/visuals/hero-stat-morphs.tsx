"use client";

import * as React from "react";

import { createDotField, DOT_ABSENT, DOT_HOLLOW, type DotField } from "@/components/visuals/dot-engine/dot-morph-dots";
import { cn } from "@/lib/utils";

import { HERO_PATTERN_HOLE_ATTRIBUTE } from "@/components/visuals/hero-pattern-hole";
import { iconStates, isStatIcon, logoStates, numberStates, STAT_GRID, type StatIcon } from "./hero-stat-shapes";

/** A built-in icon, or a logo image (sampled into dots, so a remote one must allow CORS). */
export type HeroStatShape = StatIcon | { src: string };

type Sweep = "fromLeft" | "fromRight" | "fromTop" | "fromCenter";

export interface HeroStatMorph {
  value: string;
  label: string;
  shapes: HeroStatShape[];
  /** Where the figure sits in the hero, as classes (the inset variable keeps it just outside the ruled column). */
  position: string;
  /** Each figure keeps its own time, so the four drift in and out of step rather than ticking together. */
  timing: { numberHoldsMs: number; shapeHoldsMs: number; sweepMs: number; startsAfterMs: number; sweep: Sweep };
}

// Each figure has its own run of shapes, so no two corners show the same thing at once. The site also runs the coding
// agents' logos through them; pass `{ src }` shapes to add logos.
const DEFAULT_STATS: HeroStatMorph[] = [
  {
    value: "76.0%",
    label: "WebCode groundedness, highest of six tools",
    shapes: ["monitor", "chat", "envelope", "pdf", "code"],
    position: "left-[var(--stat-inset)] top-[22%]",
    timing: { numberHoldsMs: 4200, shapeHoldsMs: 2800, sweepMs: 1100, startsAfterMs: 0, sweep: "fromLeft" },
  },
  {
    value: "68%",
    label: "Fewer tokens than Zilliz, at higher accuracy",
    shapes: ["search", "document", "lightning", "monitor", "code"],
    position: "left-[var(--stat-inset)] top-[72%]",
    timing: { numberHoldsMs: 5000, shapeHoldsMs: 3400, sweepMs: 1400, startsAfterMs: 1900, sweep: "fromCenter" },
  },
  {
    value: "99.9%",
    label: "Uptime SLA on Enterprise",
    shapes: ["pdf", "chat", "search", "monitor", "lightning"],
    position: "right-[var(--stat-inset)] top-[22%]",
    timing: { numberHoldsMs: 4600, shapeHoldsMs: 3000, sweepMs: 1250, startsAfterMs: 1000, sweep: "fromTop" },
  },
  {
    value: "1,000",
    label: "Free credits every month",
    shapes: ["envelope", "lightning", "code", "chat", "document"],
    position: "right-[var(--stat-inset)] top-[72%]",
    timing: { numberHoldsMs: 5400, shapeHoldsMs: 3700, sweepMs: 1500, startsAfterMs: 2800, sweep: "fromRight" },
  },
];

const PITCH = 4;
const DOT = { pitch: PITCH, dotRadius: PITCH * 0.4, ringStroke: 0.8, haloRadius: 0, easeSeconds: 0.08 };
// A little scatter on top of the sweep, so its leading edge isn't a ruler line.
const SWEEP_SCATTER_MS = 220;
// The sweep's front turns every dot it crosses into a ring for a beat before it settles, so a change reads as a
// band of rings traveling across the figure rather than dots quietly swapping.
const RING_MS = 170;
const RING_SCATTER_MS = 160;
const SETTLE_ALLOWANCE_MS = 500;
const MAX_PIXEL_RATIO = 2;
const LONGEST_FRAME_SECONDS = 0.05;

function scatter(cell: number) {
  const h = Math.imul(cell ^ 0x9e3779b9, 2654435761) >>> 0;
  return (h % 1000) / 1000;
}

function sweepShare(sweep: Sweep, cell: number) {
  const column = cell % STAT_GRID.columns;
  const row = Math.floor(cell / STAT_GRID.columns);
  if (sweep === "fromLeft") return column / (STAT_GRID.columns - 1);
  if (sweep === "fromRight") return 1 - column / (STAT_GRID.columns - 1);
  if (sweep === "fromTop") return row / (STAT_GRID.rows - 1);
  const dx = (column - (STAT_GRID.columns - 1) / 2) / STAT_GRID.columns;
  const dy = (row - (STAT_GRID.rows - 1) / 2) / STAT_GRID.columns;
  return Math.min(1, Math.hypot(dx, dy) * 2);
}

const easeInOut = (share: number) => (share < 0.5 ? 2 * share * share : 1 - (-2 * share + 2) ** 2 / 2);

function cellDelays({ sweep, sweepMs }: HeroStatMorph["timing"]) {
  return Float32Array.from({ length: STAT_GRID.columns * STAT_GRID.rows }, (_, cell) => easeInOut(sweepShare(sweep, cell)) * sweepMs + scatter(cell) * SWEEP_SCATTER_MS);
}

function cellRingHolds() {
  return Float32Array.from({ length: STAT_GRID.columns * STAT_GRID.rows }, (_, cell) => RING_MS + scatter(cell * 31 + 7) * RING_SCATTER_MS);
}

function ringedTarget(from: number, to: number, sinceFront: number, ringHold: number) {
  if (sinceFront < 0) return from;
  if (sinceFront < ringHold && (from !== DOT_ABSENT || to !== DOT_ABSENT)) return DOT_HOLLOW;
  return to;
}

interface StatTrack {
  timing: HeroStatMorph["timing"];
  delays: Float32Array;
  ringHolds: Float32Array;
  canvas: HTMLCanvasElement;
  label: HTMLElement;
  field: DotField;
  frames: Uint8Array[];
  index: number;
  from: Uint8Array;
  targets: Uint8Array;
  changedAt: number;
  nextChangeAt: number;
  isMoving: boolean;
}

// A logo that fails to load is left out of the run rather than stopping the figure.
async function loadShapes(shapes: HeroStatShape[]) {
  const states = await Promise.all(shapes.map((shape) => (typeof shape === "string" ? (isStatIcon(shape) ? iconStates(shape) : null) : logoStates(shape.src).catch(() => null))));
  return states.filter((state): state is Uint8Array => state !== null);
}

function fitCanvas(canvas: HTMLCanvasElement) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  canvas.width = Math.round(STAT_GRID.columns * PITCH * pixelRatio);
  canvas.height = Math.round(STAT_GRID.rows * PITCH * pixelRatio);
  return pixelRatio;
}

/**
 * The hero's figures in the brand dot grid, set in its open space with no card. Each holds, then melts across into a
 * run of shapes (a monitor, an envelope, a logo) and back, pausing briefly on every one. Shown on screens 80rem and
 * wider, drawn in `currentColor` with figures set in the heading face. It sleeps between changes, pauses off screen,
 * and holds the numbers still under reduced motion; screen readers get the figures as a list.
 */
export function HeroStatMorphs({ stats = DEFAULT_STATS, label = "Context.dev in numbers", className }: { stats?: HeroStatMorph[]; label?: string; className?: string }) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRefs = React.useRef<(HTMLCanvasElement | null)[]>([]);
  const labelRefs = React.useRef<(HTMLParagraphElement | null)[]>([]);
  const statsRef = React.useRef(stats);
  statsRef.current = stats;
  const statsKey = JSON.stringify(stats);

  React.useEffect(() => {
    const STATS = statsRef.current;
    const root = rootRef.current;
    const canvases = canvasRefs.current.slice(0, STATS.length);
    const labels = labelRefs.current.slice(0, STATS.length);
    if (!root || canvases.some((canvas) => !canvas) || labels.some((label) => !label)) return;
    const color = getComputedStyle(root).color;
    const palette = { dots: color, background: "transparent" };
    let pixelRatio = 1;

    const drawTrack = (track: StatTrack) => {
      const context = track.canvas.getContext("2d");
      if (!context) return;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, track.canvas.width, track.canvas.height);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      track.field.draw(context, palette);
    };

    const fitAll = () => {
      for (const canvas of canvases) pixelRatio = fitCanvas(canvas as HTMLCanvasElement);
    };
    if (STATS.length === 0) return;
    fitAll();

    let isDisposed = false;
    let tracks: StatTrack[] = [];
    let isVisible = true;
    let frame = 0;
    let lastFrameAt = 0;
    let wakeTimer = 0;

    const holdFor = (track: StatTrack) => (track.index === 0 ? track.timing.numberHoldsMs : track.timing.shapeHoldsMs);

    const step = (now: number) => {
      frame = 0;
      const seconds = Math.min(LONGEST_FRAME_SECONDS, lastFrameAt ? (now - lastFrameAt) / 1000 : 0);
      lastFrameAt = now;
      for (const track of tracks) {
        if (!track.isMoving && now >= track.nextChangeAt) {
          track.from = track.frames[track.index];
          track.index = (track.index + 1) % track.frames.length;
          // The label names the figure, so it only shows while the figure is the number rather than a shape.
          track.label.style.opacity = track.index === 0 ? "1" : "0";
          track.changedAt = now;
          track.isMoving = true;
        }
        if (!track.isMoving) continue;
        const next = track.frames[track.index];
        const sinceChange = now - track.changedAt;
        for (let cell = 0; cell < next.length; cell++) track.targets[cell] = ringedTarget(track.from[cell], next[cell], sinceChange - track.delays[cell], track.ringHolds[cell]);
        const isSettled = track.field.advance(track.targets, seconds);
        drawTrack(track);
        if (isSettled && sinceChange >= track.timing.sweepMs + SWEEP_SCATTER_MS + RING_MS + RING_SCATTER_MS + SETTLE_ALLOWANCE_MS) {
          track.isMoving = false;
          track.nextChangeAt = now + holdFor(track);
        }
      }
      schedule(now);
    };

    // Between changes nothing moves, so the loop sleeps until the next corner is due rather than drawing still frames.
    const schedule = (now: number) => {
      if (isDisposed || !isVisible || document.hidden) return;
      if (tracks.some((track) => track.isMoving)) {
        frame = requestAnimationFrame(step);
        return;
      }
      lastFrameAt = 0;
      const due = Math.min(...tracks.map((track) => track.nextChangeAt));
      window.clearTimeout(wakeTimer);
      wakeTimer = window.setTimeout(() => (frame = requestAnimationFrame(step)), Math.max(0, due - now));
    };

    const wake = () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(wakeTimer);
      // Picking up after a pause, every corner waits out a fresh hold instead of all changing at once.
      const now = performance.now();
      for (const track of tracks) {
        if (!track.isMoving) track.nextChangeAt = now + holdFor(track) + track.timing.startsAfterMs;
      }
      schedule(now);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) wake();
    });
    const onVisibilityChange = () => {
      if (!document.hidden) wake();
    };
    const onResize = () => {
      fitAll();
      tracks.forEach(drawTrack);
    };

    // The figures are set in the heading face, so they wait for it rather than rasterizing a fallback.
    void document.fonts.ready
      .then(async () => {
        const fontFamily = getComputedStyle(root).fontFamily;
        const numbers = STATS.map((stat) => numberStates(stat.value, fontFamily));
        tracks = STATS.map((stat, index) => {
          const field = createDotField({ ...STAT_GRID, ...DOT });
          field.seed(numbers[index]);
          return {
            timing: stat.timing,
            delays: cellDelays(stat.timing),
            ringHolds: cellRingHolds(),
            canvas: canvases[index] as HTMLCanvasElement,
            label: labels[index] as HTMLElement,
            field,
            frames: [numbers[index]],
            index: 0,
            from: numbers[index],
            targets: new Uint8Array(numbers[index]),
            changedAt: 0,
            nextChangeAt: Infinity,
            isMoving: false,
          };
        });
        tracks.forEach(drawTrack);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const shapeSets = await Promise.all(STATS.map((stat) => loadShapes(stat.shapes)));
        if (isDisposed) return;
        shapeSets.forEach((shapes, index) => (tracks[index].frames = [numbers[index], ...shapes]));
        visibility.observe(root);
        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("resize", onResize);
      })
      .catch(() => {
        // Without its shapes each figure simply stays put.
      });

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(wakeTimer);
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", onResize);
    };
  }, [statsKey]);

  return (
    <div
      ref={rootRef}
      data-slot="hero-stat-morphs"
      className={cn(
        "pointer-events-none absolute inset-0 hidden font-sans text-brand min-[80rem]:block",
        "[--stat-inset:calc((100vw_-_min(85vw,var(--ds-layout-column-wide)))_/_2_+_2.5rem)]",
        className,
      )}
    >
      <ul className="sr-only" aria-label={label}>
        {stats.map((stat) => (
          <li key={stat.value}>
            {stat.value}: {stat.label}
          </li>
        ))}
      </ul>
      {stats.map((stat, index) => (
        <div
          key={stat.value}
          aria-hidden="true"
          {...{ [HERO_PATTERN_HOLE_ATTRIBUTE]: "box" }}
          className={cn("absolute flex flex-col items-center gap-2", stat.position)}
          style={{ width: STAT_GRID.columns * PITCH }}
        >
          <canvas
            ref={(canvas) => {
              canvasRefs.current[index] = canvas;
            }}
            style={{ width: STAT_GRID.columns * PITCH, height: STAT_GRID.rows * PITCH }}
          />
          <p
            ref={(label) => {
              labelRefs.current[index] = label;
            }}
            className="text-center text-caption leading-snug text-balance text-fg-subtle transition-opacity duration-300 ease-out motion-reduce:transition-none"
          >
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
