"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// Usage over time as stacked bars, one a bucket, each series a band in its color, over a value axis and three dates.
// The bars grow up from the axis the first time only, left to right; when the data changes but the number of bars
// doesn't (a new metric, breakdown or filter), they glide from what's on screen to the new values (250ms), and a new
// number of bars crossfades in. The legend is the series picker: a click picks one series out, shift- or cmd-click
// adds or removes it, and the rest fade back. Hovering a bucket shows its breakdown in the shared chart tooltip.

export type ChartBucket<K extends string = string> = { label: string; total: number; values: Partial<Record<K, number>> };
export type ChartSeries<K extends string = string> = { key: K; label: string; color: string };
export type SeriesSelectMode = "only" | "toggle";

export const Y_INTERVALS = 4;
const PAD = { top: 12, right: 4, bottom: 26, left: 36 };
const BAR_SHARE = 0.72;
const BAR_MIN = 3;
const BAR_MAX = 28;
const BAR_RADIUS = 3;
const MORPH_MS = 250;
const DRAW_IN_MS = 800;
const DRAW_IN_STAGGER_MS = 300;
// The brand's ease-out, cubic-bezier(0.22, 1, 0.36, 1), which is ease-out quint.
const easeOut = (t: number) => 1 - (1 - t) ** 5;

type Shown<K extends string> = { buckets: ChartBucket<K>[]; top: number; generation: number };

/** The axis top: a round step (1, 2, 2.5 or 5 times a power of ten, at least 1) times the number of intervals. */
export function niceMax(peak: number) {
  const raw = peak / Y_INTERVALS;
  if (raw <= 1) return Y_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((c) => c >= raw) ?? raw;
  return step * Y_INTERVALS;
}

/** Measures the chart's box, so bars, gaps and text are drawn in real pixels however wide the card is. */
export function useChartSize() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}

/** Plain click: that series alone (again: all). Shift, cmd or ctrl: add or remove it. */
export function seriesSelectModeForClick(event: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }): SeriesSelectMode {
  return event.shiftKey || event.metaKey || event.ctrlKey ? "toggle" : "only";
}

/** The legend's selection: which series are picked out, and the set of the others to fade. */
export function useSeriesSelection<K extends string>(series: { key: K }[]) {
  const [selected, setSelected] = React.useState<K[]>([]);
  // Selections survive range and metric changes, so keys whose series are gone drop out instead of leaving an empty chart.
  const active = React.useMemo(() => {
    const keys = new Set(series.map((s) => s.key));
    return selected.filter((k) => keys.has(k));
  }, [selected, series]);
  const selectSeries = React.useCallback(
    (key: K, mode: SeriesSelectMode) =>
      setSelected(mode === "toggle" ? (active.includes(key) ? active.filter((k) => k !== key) : [...active, key]) : active.length === 1 && active[0] === key ? [] : [key]),
    [active],
  );
  const fadedKeys = React.useMemo(() => {
    const picked = new Set(active);
    return new Set(active.length === 0 ? [] : series.map((s) => s.key).filter((k) => !picked.has(k)));
  }, [active, series]);
  return { fadedKeys, selectSeries };
}

const same = <K extends string>(a: ChartBucket<K>, b: ChartBucket<K>) =>
  a.total === b.total && Object.keys({ ...a.values, ...b.values }).every((k) => (a.values[k as K] ?? 0) === (b.values[k as K] ?? 0));

function mix<K extends string>(from: ChartBucket<K>, to: ChartBucket<K>, p: number): ChartBucket<K> {
  const values: Partial<Record<K, number>> = {};
  for (const k of Object.keys({ ...from.values, ...to.values }) as K[]) values[k] = (from.values[k] ?? 0) + ((to.values[k] ?? 0) - (from.values[k] ?? 0)) * p;
  return { label: to.label, values, total: from.total + (to.total - from.total) * p };
}

// An interrupted glide picks up from wherever it got to; a new number of bars has nothing to glide from, so it swaps.
function useMorphedBuckets<K extends string>(buckets: ChartBucket<K>[], top: number): Shown<K> {
  const [shown, setShown] = React.useState<Shown<K>>({ buckets, top, generation: 0 });
  const ref = React.useRef(shown);
  React.useLayoutEffect(() => {
    const from = ref.current;
    const show = (next: Shown<K>) => {
      ref.current = next;
      setShown(next);
    };
    const unchanged = from.top === top && from.buckets.length === buckets.length && from.buckets.every((b, i) => same(b, buckets[i]));
    const canMorph = from.buckets.length === buckets.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (unchanged || !canMorph) {
      show({ buckets, top, generation: from.generation + (from.buckets.length === buckets.length ? 0 : 1) });
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const p = Math.min(1, (now - start) / MORPH_MS);
      const e = easeOut(p);
      show(p === 1 ? { buckets, top, generation: from.generation } : { buckets: buckets.map((b, i) => mix(from.buckets[i], b, e)), top: from.top + (top - from.top) * e, generation: from.generation });
      if (p < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [buckets, top]);
  return shown;
}

function barOutline(x: number, barTop: number, barWidth: number, baseline: number) {
  const ry = Math.min(BAR_RADIUS, baseline - barTop);
  const rx = Math.min(BAR_RADIUS, barWidth / 2);
  return `M${x},${baseline}V${barTop + ry}q0,-${ry} ${rx},-${ry}H${x + barWidth - rx}q${rx},0 ${rx},${ry}V${baseline}Z`;
}

export function BarChart<K extends string>({
  buckets,
  series,
  unit,
  label,
  fadedKeys,
  onSeriesSelect,
  legendAside,
  className,
}: {
  buckets: ChartBucket<K>[];
  series: ChartSeries<K>[];
  /** What the numbers count, plural ("calls"); the tooltip drops the s for one. */
  unit: string;
  /** The chart's accessible name. */
  label: string;
  /** Series left out of the picked set: they fade back. */
  fadedKeys?: Set<K>;
  /** Makes the legend the series picker (see useSeriesSelection). */
  onSeriesSelect?: (key: K, mode: SeriesSelectMode) => void;
  /** A control for the right end of the legend row, such as the card's metric switch. */
  legendAside?: React.ReactNode;
  className?: string;
}) {
  const { ref, size } = useChartSize();
  // Plain characters only, since the id names SVG clip paths referenced by url(#...).
  const id = `chart${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [cursor, setCursor] = React.useState<ChartCursor>();
  // The bars grow in from the axis the first time only; after that, changes glide or crossfade instead of redrawing.
  const [drawnIn, setDrawnIn] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setDrawnIn(true), DRAW_IN_MS);
    return () => clearTimeout(t);
  }, []);

  const plotWidth = Math.max(0, size.width - PAD.left - PAD.right);
  const plotHeight = Math.max(0, size.height - PAD.top - PAD.bottom);
  // The axis labels name the new scale straight away; the bars get there through the glide.
  const top = niceMax(Math.max(0, ...buckets.map((b) => b.total)));
  const shown = useMorphedBuckets(buckets, top);
  const slot = buckets.length ? plotWidth / buckets.length : 0;
  const barWidth = Math.min(BAR_MAX, Math.max(BAR_MIN, slot * BAR_SHARE));
  const centerAt = (i: number) => PAD.left + slot * (i + 0.5);
  const baseline = PAD.top + plotHeight;
  const yAt = (v: number) => baseline - (v / shown.top) * plotHeight;
  const valueY = (v: number) => baseline - (v / top) * plotHeight;
  const labelIndexes = [...new Set([0, Math.floor((buckets.length - 1) / 2), buckets.length - 1])].filter((i) => i >= 0);
  const ready = size.width > 0 && size.height > 0;
  const active = activeIndex === null ? null : buckets[activeIndex];

  return (
    <div data-slot="bar-chart" className={cn("flex flex-1 flex-col gap-2", className)}>
      <div
        ref={ref}
        role="img"
        aria-label={label}
        onMouseMove={(e) => {
          if (!slot) return;
          const x = e.clientX - e.currentTarget.getBoundingClientRect().left - PAD.left;
          setCursor({ x: e.clientX, y: e.clientY });
          setActiveIndex(Math.min(buckets.length - 1, Math.max(0, Math.floor(x / slot))));
        }}
        onMouseLeave={() => setActiveIndex(null)}
        className="relative min-h-28 flex-1"
      >
        {ready && (
          <svg width={size.width} height={size.height} className="absolute inset-0 overflow-visible" aria-hidden>
            {Array.from({ length: Y_INTERVALS + 1 }, (_, s) => {
              const v = (top * s) / Y_INTERVALS;
              return (
                <g key={s}>
                  <line x1={PAD.left} x2={size.width - PAD.right} y1={valueY(v)} y2={valueY(v)} stroke="var(--ds-color-border-subtle)" />
                  <text x={PAD.left - 8} y={valueY(v)} dy="0.32em" textAnchor="end" className="fill-fg-subtle text-axis tabular-nums">
                    {v.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}
                  </text>
                </g>
              );
            })}
            <g key={shown.generation} className={cn(shown.generation > 0 && "animate-fade-in")}>
              {shown.buckets.map((bucket, i) => {
                const x = centerAt(i) - barWidth / 2;
                let below = 0;
                const bands = series.map((s) => {
                  const v = bucket.values[s.key] ?? 0;
                  const band = { s, y: yAt(below + v), height: (v / shown.top) * plotHeight };
                  below += v;
                  return band;
                });
                // The bar's top is the top of its drawn bands, which a breakdown switch can leave short of the total mid-glide.
                const barTop = yAt(below);
                return (
                  <g key={i}>
                    <rect x={x - 3} y={PAD.top - 4} width={barWidth + 6} height={plotHeight + 8} rx={3} fill="var(--ds-color-wash-hover)" opacity={activeIndex === i ? 1 : 0} className="transition-opacity duration-150" />
                    {baseline - barTop > 0 && (
                      <g
                        className={cn("origin-bottom [transform-box:fill-box] motion-reduce:animate-none", !drawnIn && "animate-chart-bar")}
                        style={drawnIn ? undefined : { animationDelay: `${Math.round((i / Math.max(1, shown.buckets.length - 1)) * DRAW_IN_STAGGER_MS)}ms` }}
                      >
                        <clipPath id={`${id}-${i}`}>
                          <path d={barOutline(x, barTop, barWidth, baseline)} />
                        </clipPath>
                        <g clipPath={`url(#${id}-${i})`}>
                          {bands.map(({ s, y, height }) =>
                            height > 0 ? <rect key={s.key} x={x} y={y} width={barWidth} height={height} fill={s.color} opacity={fadedKeys?.has(s.key) ? 0.18 : 1} className="transition-opacity duration-200" /> : null,
                          )}
                        </g>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
            {/* The first date starts at its column's left edge and the last ends at its right one, so a long label stays inside the card. */}
            {labelIndexes.map((i) => {
              const first = i === 0 && buckets.length > 1;
              const last = i === buckets.length - 1 && buckets.length > 1;
              return (
                <text key={i} x={first ? centerAt(i) - barWidth / 2 : last ? centerAt(i) + barWidth / 2 : centerAt(i)} y={size.height - 6} textAnchor={first ? "start" : last ? "end" : "middle"} className="fill-fg-subtle text-axis">
                  {buckets[i].label}
                </text>
              );
            })}
          </svg>
        )}
        {active && cursor && (
          <ChartTooltip cursor={cursor} title={active.label} total={active.total} unit={unit} rows={series.map((s) => ({ key: s.key, label: s.label, color: s.color, value: active.values[s.key] ?? 0 }))} />
        )}
      </div>
      {/* One line at the switch's height whether or not a switch sits beside it, so the card's bottom never moves; a
          legend too long for the line scrolls sideways instead of wrapping. */}
      <div className="flex h-7 items-center gap-3">
        <ul className="flex min-w-0 flex-1 items-center gap-x-2.5 overflow-x-auto pl-1 text-axis whitespace-nowrap text-fg-muted [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {series.map((s) => {
            const faded = fadedKeys?.has(s.key) ?? false;
            const content = (
              <>
                <span className="size-1.5 rounded-pill" style={{ background: s.color }} aria-hidden />
                {s.label}
              </>
            );
            return (
              <li key={s.key} className={cn("shrink-0 transition-opacity duration-200", faded && "opacity-40")}>
                {onSeriesSelect ? (
                  <button type="button" aria-pressed={Boolean(fadedKeys?.size) && !faded} onClick={(e) => onSeriesSelect(s.key, seriesSelectModeForClick(e))} className="flex items-center gap-1 transition-colors duration-150 hover:text-fg">
                    {content}
                  </button>
                ) : (
                  <span className="flex items-center gap-1">{content}</span>
                )}
              </li>
            );
          })}
        </ul>
        {legendAside}
      </div>
    </div>
  );
}

export type ChartCursor = { x: number; y: number };
export type ChartTooltipRow = { key: string; label: string; color?: string; value: number };

const CURSOR_GAP = 14;
const EDGE_GAP = 8;
const formatShare = (share: number) => (share > 0 && share < 0.01 ? "<1%" : `${Math.round(share * 100)}%`);

/**
 * The one hover card every chart shares: small, pinned just off the pointer (below and to the right, flipping wherever
 * it would run past the window), following it without easing since it's read while moving, and portaled to the top
 * layer so no card or dialog around the chart can clip it. Rows with nothing in them are left out.
 */
export function ChartTooltip({
  cursor,
  title,
  total,
  unit,
  share,
  rows = [],
}: {
  /** The pointer, in viewport coordinates (clientX, clientY). */
  cursor: ChartCursor;
  title: React.ReactNode;
  total: number;
  unit: string;
  /** The total's share of a larger whole, for a chart where the hovered thing is one part. */
  share?: number;
  rows?: ChartTooltipRow[];
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const container = usePortalContainer();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useLayoutEffect(() => {
    const card = ref.current;
    if (!card) return;
    const { width, height } = card.getBoundingClientRect();
    const fitsRight = cursor.x + CURSOR_GAP + width <= window.innerWidth - EDGE_GAP;
    const fitsBelow = cursor.y + CURSOR_GAP + height <= window.innerHeight - EDGE_GAP;
    card.style.left = `${Math.max(EDGE_GAP, fitsRight ? cursor.x + CURSOR_GAP : cursor.x - CURSOR_GAP - width)}px`;
    card.style.top = `${Math.max(EDGE_GAP, fitsBelow ? cursor.y + CURSOR_GAP : cursor.y - CURSOR_GAP - height)}px`;
  });
  if (!mounted) return null;
  const shownRows = rows.filter((r) => r.value > 0);
  return createPortal(
    <div ref={ref} role="tooltip" data-slot="chart-tooltip" className="pointer-events-none fixed top-0 left-0 z-60 w-max min-w-40 rounded-control bg-surface px-2.5 py-2 text-caption shadow-floating">
      <div className="flex items-baseline justify-between gap-5">
        <span className="flex items-center gap-1.5 font-medium text-fg">{title}</span>
        <span className="text-fg-muted">
          <span className="font-medium text-fg tabular-nums">{total.toLocaleString("en-US")}</span> {total === 1 ? unit.replace(/s$/, "") : unit}
          {share !== undefined && <span className="ml-2 text-fg-subtle tabular-nums">{formatShare(share)}</span>}
        </span>
      </div>
      {shownRows.length > 0 && (
        <ul className="mt-1.5 flex flex-col gap-1 border-t border-line-subtle pt-1.5">
          {shownRows.map((r) => (
            <li key={r.key} className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-pill bg-brand" style={r.color ? { background: r.color } : undefined} aria-hidden />
              <span className="flex-1 text-fg-muted">{r.label}</span>
              <span className="font-medium tabular-nums">{r.value.toLocaleString("en-US")}</span>
              <span className="w-8 text-right text-fg-subtle tabular-nums">{formatShare(total === 0 ? 0 : r.value / total)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>,
    container ?? document.body,
  );
}
