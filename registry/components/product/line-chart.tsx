"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { type ChartBucket, type ChartCursor, type ChartSeries, ChartTooltip, niceMax, useChartSize, Y_INTERVALS } from "@/components/product/bar-chart";

// Usage over time as one smooth line over a soft fill, in brand blue for the total (or the series it follows). The last
// stretch is dotted: that bucket (today) is still filling. Horizontal gridlines only, 11px subtle labels, a hover
// marker and the shared chart tooltip. The line draws itself in from the left on mount (900ms, as the redesign's
// chart-line-in), the fill fades in after it and the markers pop in along it. The redesigned dashboard charts usage
// as stacked bars (bar-chart); use this where one trend over time is the whole story.

export type { ChartBucket, ChartSeries };

const PAD = { top: 10, right: 12, bottom: 30, left: 40 };
const X_LABELS = 7;
const X_LABEL_PX = 64;
const X_LABEL_CLEARANCE = 44;

/** Which buckets get a label under the axis: up to seven, as many as fit, always the first and last. */
export function axisLabelIndexes(count: number, plotWidth = Infinity) {
  const labels = Math.min(X_LABELS, count, Math.max(2, Math.floor(plotWidth / X_LABEL_PX)));
  return Array.from(new Set(Array.from({ length: labels }, (_, s) => Math.round((s * (count - 1)) / Math.max(1, labels - 1)))));
}

/** A rounded curve through the points (Catmull-Rom as cubic Beziers), one segment per gap, never dipping below zero. */
function smoothSegments(points: Array<[number, number]>, floorY: number) {
  return points.slice(1).map(([x2, y2], i) => {
    const [x0, y0] = points[Math.max(0, i - 1)];
    const [x1, y1] = points[i];
    const [x3, y3] = points[Math.min(points.length - 1, i + 2)];
    return `C${x1 + (x2 - x0) / 6},${Math.min(floorY, y1 + (y2 - y0) / 6)} ${x2 - (x3 - x1) / 6},${Math.min(floorY, y2 - (y3 - y1) / 6)} ${x2},${y2}`;
  });
}

export function LineChart<K extends string>({
  buckets,
  series,
  unit,
  label,
  headline,
  lineKey,
  className,
}: {
  buckets: ChartBucket<K>[];
  series: ChartSeries<K>[];
  unit: string;
  label: string;
  headline?: string;
  lineKey?: K;
  className?: string;
}) {
  const gradientId = React.useId();
  const { ref, size } = useChartSize();
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [cursor, setCursor] = React.useState<ChartCursor>();

  const plotWidth = Math.max(0, size.width - PAD.left - PAD.right);
  const plotHeight = Math.max(0, size.height - PAD.top - PAD.bottom);
  const valueOf = (b: ChartBucket<K>) => (lineKey ? (b.values[lineKey] ?? 0) : b.total);
  const top = niceMax(Math.max(0, ...buckets.map(valueOf)));
  const xAt = (i: number) => PAD.left + (buckets.length === 1 ? plotWidth / 2 : (i / (buckets.length - 1)) * plotWidth);
  const yAt = (v: number) => PAD.top + plotHeight - (v / top) * plotHeight;

  const lineColor = series.find((s) => s.key === lineKey)?.color ?? "var(--ds-color-brand)";
  const points = buckets.map((b, i): [number, number] => [xAt(i), yAt(valueOf(b))]);
  const baseline = PAD.top + plotHeight;
  const segments = smoothSegments(points, baseline);
  const start = points.length ? `M${points[0][0]},${points[0][1]}` : "";
  const settled = `${start} ${segments.slice(0, -1).join(" ")}`;
  const pending = points.length > 1 ? `M${points[points.length - 2][0]},${points[points.length - 2][1]} ${segments[segments.length - 1]}` : "";
  const area = points.length > 1 ? `${start} ${segments.join(" ")} L${xAt(buckets.length - 1)},${baseline} L${xAt(0)},${baseline} Z` : "";
  const labelIndexes = axisLabelIndexes(buckets.length, plotWidth || undefined);

  const active = activeIndex === null ? null : buckets[activeIndex];
  const activeX = activeIndex === null ? 0 : xAt(activeIndex);
  const ready = size.width > 0 && size.height > 0;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      data-slot="line-chart"
      onMouseMove={(e) => {
        if (!plotWidth) return;
        const x = e.clientX - e.currentTarget.getBoundingClientRect().left - PAD.left;
        setCursor({ x: e.clientX, y: e.clientY });
        setActiveIndex(Math.min(buckets.length - 1, Math.max(0, Math.round((x / plotWidth) * (buckets.length - 1)))));
      }}
      onMouseLeave={() => setActiveIndex(null)}
      className={cn("relative min-h-48 flex-1", className)}
    >
      {headline && ready && (
        <span
          className="pointer-events-none absolute z-10 flex h-6 -translate-1/2 items-center rounded-control border border-line bg-surface px-2.5 text-caption text-fg-brand tabular-nums"
          style={{ left: PAD.left + plotWidth / 2, top: yAt(top / Y_INTERVALS) }}
        >
          {headline}
        </span>
      )}
      {ready && (
        <svg width={size.width} height={size.height} className="absolute inset-0 overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.12} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          {Array.from({ length: Y_INTERVALS + 1 }, (_, s) => {
            const v = (top * s) / Y_INTERVALS;
            return (
              <g key={s}>
                <line x1={PAD.left} x2={size.width - PAD.right} y1={yAt(v)} y2={yAt(v)} stroke="var(--ds-color-border-subtle)" />
                <text x={PAD.left - 10} y={yAt(v)} dy="0.32em" textAnchor="end" className="fill-fg-subtle text-axis tabular-nums">
                  {v.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}
                </text>
              </g>
            );
          })}
          {labelIndexes.map((i, s) =>
            activeIndex !== null && Math.abs(xAt(i) - activeX) < X_LABEL_CLEARANCE ? null : (
              <text key={i} x={xAt(i)} y={size.height - 8} textAnchor={s === 0 ? "start" : s === labelIndexes.length - 1 ? "end" : "middle"} className="fill-fg-subtle text-axis">
                {buckets[i].label}
              </text>
            ),
          )}
          {area && <path d={area} fill={`url(#${gradientId})`} className="animate-chart-area motion-reduce:animate-none" />}
          <path d={settled} pathLength={1} strokeDasharray={1} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="animate-chart-line motion-reduce:animate-none" />
          {pending && <path d={pending} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeDasharray="0 5" className="animate-chart-area motion-reduce:animate-none" />}
          {labelIndexes.map((i) =>
            i === activeIndex ? null : (
              <circle
                key={i}
                cx={points[i][0]}
                cy={points[i][1]}
                r={4.5}
                fill="var(--ds-color-bg-default)"
                stroke={lineColor}
                strokeWidth={2}
                className="origin-center animate-chart-tip [transform-box:fill-box] motion-reduce:animate-none"
                style={{ animationDelay: `${Math.round(150 + (i / Math.max(1, buckets.length - 1)) * 650)}ms` }}
              />
            ),
          )}
          {activeIndex !== null && (
            <g>
              <line x1={activeX} x2={activeX} y1={PAD.top} y2={baseline} stroke="var(--ds-color-neutral-40)" strokeDasharray="3 4" />
              <circle cx={activeX} cy={points[activeIndex][1]} r={4.5} fill="var(--ds-color-bg-default)" stroke={lineColor} strokeWidth={2} />
            </g>
          )}
        </svg>
      )}
      {active && activeIndex !== null && (
        <>
          <span className="pointer-events-none absolute bottom-[3px] flex h-5 -translate-x-1/2 items-center rounded-control bg-brand px-2 text-caption whitespace-nowrap text-on-brand" style={{ left: activeX }}>
            {active.label}
          </span>
          {cursor && (
            <ChartTooltip
              cursor={cursor}
              title={active.label}
              total={active.total}
              unit={unit}
              rows={series.map((s) => ({ key: s.key, label: s.label, color: s.color, value: active.values[s.key] ?? 0 }))}
            />
          )}
        </>
      )}
    </div>
  );
}
