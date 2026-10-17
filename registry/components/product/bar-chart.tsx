"use client";

import * as React from "react";

import { type ChartBucket, type ChartSeries, ChartTooltip, niceMax, useChartSize, Y_INTERVALS } from "@/components/product/line-chart";
import { cn } from "@/lib/utils";

// Usage over time as stacked bars: a bar a bucket, each series a band in its color, rounded on top. Bars grow up from
// the axis on mount; when the data changes but the number of bars doesn't, they glide to the new values (250ms) so a
// switch reads as the same bars changing. The legend can pick one series out, fading the rest.

const PAD = { top: 12, right: 4, bottom: 26, left: 36 };
const BAR_SHARE = 0.72;
const BAR_MIN = 3;
const BAR_MAX = 28;
const BAR_RADIUS = 3;
const MORPH_MS = 250;
const DRAW_IN_MS = 800;
const easeOut = (t: number) => 1 - (1 - t) ** 5;

type Shown<K extends string> = { buckets: ChartBucket<K>[]; top: number; generation: number };

const same = <K extends string>(a: ChartBucket<K>, b: ChartBucket<K>) =>
  a.total === b.total && Object.keys({ ...a.values, ...b.values }).every((k) => (a.values[k as K] ?? 0) === (b.values[k as K] ?? 0));

function mix<K extends string>(from: ChartBucket<K>, to: ChartBucket<K>, p: number): ChartBucket<K> {
  const values: Partial<Record<K, number>> = {};
  for (const k of Object.keys({ ...from.values, ...to.values }) as K[]) values[k] = (from.values[k] ?? 0) + ((to.values[k] ?? 0) - (from.values[k] ?? 0)) * p;
  return { label: to.label, values, total: from.total + (to.total - from.total) * p };
}

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

export function BarChart<K extends string>({
  buckets,
  series,
  unit,
  label,
  focusKey,
  onFocusChange,
  legendAside,
  className,
}: {
  buckets: ChartBucket<K>[];
  series: ChartSeries<K>[];
  unit: string;
  label: string;
  focusKey?: K;
  onFocusChange?: (key: K | undefined) => void;
  legendAside?: React.ReactNode;
  className?: string;
}) {
  const { ref, size } = useChartSize();
  const id = `chart${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [cursor, setCursor] = React.useState<{ x: number; y: number }>();
  const [drawnIn, setDrawnIn] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setDrawnIn(true), DRAW_IN_MS);
    return () => clearTimeout(t);
  }, []);

  const plotWidth = Math.max(0, size.width - PAD.left - PAD.right);
  const plotHeight = Math.max(0, size.height - PAD.top - PAD.bottom);
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
          const box = e.currentTarget.getBoundingClientRect();
          setCursor({ x: e.clientX - box.left, y: e.clientY - box.top });
          setActiveIndex(Math.min(buckets.length - 1, Math.max(0, Math.floor((e.clientX - box.left - PAD.left) / slot))));
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
                const barTop = yAt(below);
                const h = baseline - barTop;
                const r = Math.min(BAR_RADIUS, h);
                const rx = Math.min(BAR_RADIUS, barWidth / 2);
                return (
                  <g key={i}>
                    <rect x={x - 3} y={PAD.top - 4} width={barWidth + 6} height={plotHeight + 8} rx={3} fill="var(--ds-color-wash-hover)" opacity={activeIndex === i ? 1 : 0} className="transition-opacity duration-150" />
                    {h > 0 && (
                      <g
                        className={cn("origin-bottom [transform-box:fill-box] motion-reduce:animate-none", !drawnIn && "animate-chart-bar")}
                        style={drawnIn ? undefined : { animationDelay: `${Math.round((i / Math.max(1, shown.buckets.length - 1)) * 300)}ms` }}
                      >
                        <clipPath id={`${id}-${i}`}>
                          <path d={`M${x},${baseline}V${barTop + r}q0,-${r} ${rx},-${r}H${x + barWidth - rx}q${rx},0 ${rx},${r}V${baseline}Z`} />
                        </clipPath>
                        <g clipPath={`url(#${id}-${i})`}>
                          {bands.map(({ s, y, height }) =>
                            height > 0 ? <rect key={s.key} x={x} y={y} width={barWidth} height={height} fill={s.color} opacity={focusKey !== undefined && s.key !== focusKey ? 0.18 : 1} className="transition-opacity duration-200" /> : null,
                          )}
                        </g>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
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
          <ChartTooltip
            className={cn(cursor.x > size.width / 2 && "-translate-x-full")}
            style={{ left: cursor.x + (cursor.x > size.width / 2 ? -16 : 16), top: Math.max(0, cursor.y - 40) }}
            title={active.label}
            total={active.total}
            unit={unit}
            rows={series.map((s) => ({ label: s.label, color: s.color, value: active.values[s.key] ?? 0 }))}
          />
        )}
      </div>
      <div className="flex h-7 items-center gap-3">
        <ul className="flex min-w-0 flex-1 items-center gap-x-2.5 overflow-x-auto pl-1 text-axis whitespace-nowrap text-fg-muted [scrollbar-width:none]">
          {series.map((s) => {
            const content = (
              <>
                <span className="size-1.5 rounded-pill" style={{ background: s.color }} aria-hidden />
                {s.label}
              </>
            );
            return (
              <li key={s.key} className={cn("shrink-0 transition-opacity duration-200", focusKey !== undefined && s.key !== focusKey && "opacity-40")}>
                {onFocusChange ? (
                  <button type="button" aria-pressed={s.key === focusKey} onClick={() => onFocusChange(s.key === focusKey ? undefined : s.key)} className="flex items-center gap-1 transition-colors duration-150 hover:text-fg">
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
