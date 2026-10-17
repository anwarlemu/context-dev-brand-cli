"use client";

import * as React from "react";

import { useHoverDotMorph, type LoadDotMorph } from "./use-hover-dot-morph";
import { cn } from "@/lib/utils";

import { LOGO_CELLS, LOGO_GRID, LOGO_LEFT, LOGO_TOP } from "./customer-logo-grid";
import { type LogoCell, sampleLogoCells } from "@/components/visuals/logo-dot-sampling";

const { columns: GRID_COLUMNS, rows: GRID_ROWS, pitch: DOT_PITCH, dotRadius: DOT_RADIUS, ringStroke: RING_STROKE } = LOGO_GRID;
// The backdrop uses every other cell at low opacity so it reads as texture, and keeps this many cells clear of the
// logo's dots so the logo keeps a clean silhouette.
const FIELD_STEP = 2;
const FIELD_CLEARANCE = 2;
const FIELD_OPACITY = 0.22;
const VIEW_WIDTH = GRID_COLUMNS * DOT_PITCH;
const VIEW_HEIGHT = GRID_ROWS * DOT_PITCH;
// Rings stay this far inside the visible edge, so the card never slices one in half.
const FIELD_EDGE_MARGIN = DOT_PITCH / 2;

interface ViewBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface FieldCell {
  column: number;
  row: number;
}

const center = (index: number) => (index + 0.5) * DOT_PITCH;

/** Many same-sized dots as one SVG path, each a closed pair of arcs, rather than hundreds of circles. */
function dotsPath(centers: Iterable<{ cx: number; cy: number }>, radius: number) {
  const diameter = +(radius * 2).toFixed(2);
  const r = +radius.toFixed(2);
  let path = "";
  for (const { cx, cy } of centers) path += `M${+(cx - radius).toFixed(2)} ${+cy.toFixed(2)}a${r} ${r} 0 1 0 ${diameter} 0a${r} ${r} 0 1 0 ${-diameter} 0`;
  return path;
}

// The part of the viewBox that `slice` actually shows for this element's size, in viewBox units.
function visibleBounds(width: number, height: number): ViewBounds {
  const scale = Math.max(width / VIEW_WIDTH, height / VIEW_HEIGHT);
  const visibleWidth = width / scale;
  const visibleHeight = height / scale;
  const left = (VIEW_WIDTH - visibleWidth) / 2;
  const top = (VIEW_HEIGHT - visibleHeight) / 2;
  return { left, top, right: left + visibleWidth, bottom: top + visibleHeight };
}

// The backdrop's rings, split into the ones drawn and the ones left out because they sit too near the logo.
function fieldCells(logoCells: LogoCell[], bounds: ViewBounds) {
  const nearLogo = new Set<string>();
  for (const cell of logoCells) {
    for (let dy = -FIELD_CLEARANCE; dy <= FIELD_CLEARANCE; dy++) {
      for (let dx = -FIELD_CLEARANCE; dx <= FIELD_CLEARANCE; dx++) nearLogo.add(`${cell.column + LOGO_LEFT + dx}:${cell.row + LOGO_TOP + dy}`);
    }
  }
  const shown: FieldCell[] = [];
  const cleared: FieldCell[] = [];
  for (let row = 0; row < GRID_ROWS; row += FIELD_STEP) {
    for (let column = 0; column < GRID_COLUMNS; column += FIELD_STEP) {
      const cx = center(column);
      const cy = center(row);
      const fitsInView =
        cx - DOT_RADIUS - FIELD_EDGE_MARGIN >= bounds.left &&
        cx + DOT_RADIUS + FIELD_EDGE_MARGIN <= bounds.right &&
        cy - DOT_RADIUS - FIELD_EDGE_MARGIN >= bounds.top &&
        cy + DOT_RADIUS + FIELD_EDGE_MARGIN <= bounds.bottom;
      if (fitsInView) (nearLogo.has(`${column}:${row}`) ? cleared : shown).push({ column, row });
    }
  }
  return { shown, cleared };
}

/**
 * A customer's logo redrawn in the brand dot grid, over a faint backdrop of rings that stays clear of it. Inside a link
 * (or an element marked `data-hover-morph`), hovering or focusing it melts the logo into an arrow. `onBlue` draws white
 * dots for a blue card, `onWhite` brand blue dots for a white one. A logo that cannot be sampled shows as a plain image.
 */
export function CustomerLogoDots({
  src,
  background,
  resolveSrc,
  className,
  tone = "onBlue",
}: {
  /** The logo image. A remote one must allow CORS, or pass `resolveSrc`. */
  src: string;
  /** A color painted behind the logo before sampling, for logos drawn on a tile. */
  background?: string;
  /** Maps the logo's URL to one the canvas may read (a same-origin proxy). */
  resolveSrc?: (src: string) => string;
  className?: string;
  tone?: "onBlue" | "onWhite";
}) {
  const [cells, setCells] = React.useState<LogoCell[] | null>(null);
  const [samplingFailed, setSamplingFailed] = React.useState(false);
  const [bounds, setBounds] = React.useState<ViewBounds | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const field = React.useMemo(() => (cells && bounds ? fieldCells(cells, bounds) : null), [cells, bounds]);
  const loadMorph = React.useCallback<LoadDotMorph>(
    async (canvas, onPlayingChange) => {
      if (!cells || !field) return null;
      const surface = canvas.closest("article, [data-dot-surface]");
      const { createCustomerLogoMorph } = await import("./customer-logo-morph");
      return createCustomerLogoMorph({
        canvas,
        cells,
        clearedBackdrop: { cells: field.cleared.map((cell) => cell.row * GRID_COLUMNS + cell.column), opacity: FIELD_OPACITY },
        palette: { dots: getComputedStyle(canvas).color, background: surface ? getComputedStyle(surface).backgroundColor : "transparent" },
        onPlayingChange,
      });
    },
    [cells, field],
  );
  const isMorphing = useHoverDotMorph(canvasRef, loadMorph);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => setBounds(visibleBounds(entry.contentRect.width, entry.contentRect.height)));
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  // Sampling fetches and decodes the logo, so it waits until the card is nearly on screen.
  const resolveRef = React.useRef(resolveSrc);
  React.useEffect(() => {
    resolveRef.current = resolveSrc;
  }, [resolveSrc]);
  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let cancelled = false;
    setSamplingFailed(false);
    const nearView = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        nearView.disconnect();
        sampleLogoCells(src, { background, cellsPerSide: LOGO_CELLS, resolveSrc: resolveRef.current })
          .then((sampled) => {
            if (cancelled) return;
            if (sampled.length === 0) throw new Error(`No logo pixels found in ${src}`);
            setCells(sampled);
          })
          // A logo that can't be sampled into dots falls back to the plain image, so the card is never left blank.
          .catch(() => {
            if (!cancelled) setSamplingFailed(true);
          });
      },
      { rootMargin: "600px" },
    );
    nearView.observe(svg);
    return () => {
      cancelled = true;
      nearView.disconnect();
    };
  }, [src, background]);

  const ringRadius = DOT_RADIUS - RING_STROKE / 2;
  const logoCell = (cell: LogoCell) => ({ cx: center(cell.column + LOGO_LEFT), cy: center(cell.row + LOGO_TOP) });

  return (
    <div data-slot="customer-logo-dots" className={cn("relative", tone === "onWhite" ? "text-brand" : "text-white", className)} aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        className={cn("block size-full transition-opacity duration-500 ease-out motion-reduce:transition-none", cells ? "opacity-100" : "opacity-0")}
      >
        {field && (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth={RING_STROKE}
            opacity={FIELD_OPACITY}
            d={dotsPath(
              field.shown.map((cell) => ({ cx: center(cell.column), cy: center(cell.row) })),
              ringRadius,
            )}
          />
        )}
        {cells && (
          <g className={cn(isMorphing && "invisible")}>
            <path fill="none" stroke="currentColor" strokeWidth={RING_STROKE} d={dotsPath(cells.filter((cell) => !cell.filled).map(logoCell), ringRadius)} />
            <path fill="currentColor" d={dotsPath(cells.filter((cell) => cell.filled).map(logoCell), DOT_RADIUS)} />
          </g>
        )}
      </svg>
      <canvas ref={canvasRef} className={cn("absolute inset-0 size-full", !isMorphing && "invisible")} />
      {samplingFailed && (
        <span className="absolute inset-0 flex items-center justify-center">
          <img src={src} alt="" className="size-24 rounded-shell object-contain" style={{ background }} />
        </span>
      )}
    </div>
  );
}
