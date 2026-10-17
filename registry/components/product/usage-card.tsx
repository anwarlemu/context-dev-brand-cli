"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { BarChart, type ChartBucket, type ChartSeries, type SeriesSelectMode } from "@/components/product/bar-chart";
import { GlideTabs } from "@/components/product/glide-tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { StillGlyph } from "@/components/visuals/glyph/glyph-tile";
import type { GlyphPairName } from "@/components/visuals/glyph/glyph-art";
import { cn } from "@/lib/utils";

export type UsageBreakdown<B extends string = string> = { value: B; label: string; description: string; glyph: GlyphPairName };
export type UsageRange<R extends string = string> = { value: R; label: string; short: string };
export type UsageView = { buckets: ChartBucket[]; series: ChartSeries[]; unit: string; label: string };

// The overview's usage card: one stacked bar chart for the picked breakdown. The card's title is its menu (the
// breakdown's glyph and name, opening the others with a line each); the range sits at the right on a gliding pill,
// its names shortened to 7D, 30D and 3M when the card is narrow; the legend under the chart picks series out, and
// each breakdown keeps its own pick, so switching away and back keeps it. A metric switch can sit at the legend's end.
function UsageCard<B extends string, R extends string>({
  breakdowns,
  breakdown,
  onBreakdownChange,
  ranges,
  range,
  onRangeChange,
  view,
  legendAside,
  loading = false,
  empty,
  className,
}: {
  breakdowns: UsageBreakdown<B>[];
  breakdown: B;
  onBreakdownChange: (value: B) => void;
  ranges: UsageRange<R>[];
  range: R;
  onRangeChange: (value: R) => void;
  /** The chart for the picked breakdown and range. */
  view: UsageView;
  legendAside?: React.ReactNode;
  loading?: boolean;
  /** Shown instead of the chart when there's no usage yet. */
  empty?: React.ReactNode;
  className?: string;
}) {
  const [picks, setPicks] = React.useState<Partial<Record<B, string[]>>>({});
  const seriesKeys = new Set(view.series.map((s) => s.key));
  const picked = (picks[breakdown] ?? []).filter((k) => seriesKeys.has(k));
  const pickedKeys = new Set(picked);
  const fadedKeys = new Set(picked.length ? view.series.map((s) => s.key).filter((k) => !pickedKeys.has(k)) : []);
  const select = (key: string, mode: SeriesSelectMode) =>
    setPicks((p) => ({ ...p, [breakdown]: mode === "toggle" ? (picked.includes(key) ? picked.filter((k) => k !== key) : [...picked, key]) : picked.length === 1 && picked[0] === key ? [] : [key] }));
  return (
    <section data-slot="usage-card" className={cn("@container flex h-64 flex-col rounded-card bg-surface p-2 shadow-card", className)}>
      <div className="mb-3 flex items-center gap-3">
        <BreakdownPicker options={breakdowns} value={breakdown} onValueChange={onBreakdownChange} />
        <GlideTabs
          label="Date range"
          className="ml-auto"
          value={range}
          onValueChange={onRangeChange}
          options={ranges.map((r) => ({
            value: r.value,
            ariaLabel: r.label,
            label: (
              <>
                <span className="@2xl:hidden">{r.short}</span>
                <span className="hidden @2xl:inline">{r.label}</span>
              </>
            ),
          }))}
        />
      </div>
      {loading ? (
        <Skeleton className="flex-1 rounded-card" />
      ) : empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-center">{empty}</div>
      ) : (
        <BarChart buckets={view.buckets} series={view.series} unit={view.unit} label={view.label} fadedKeys={fadedKeys} onSeriesSelect={select} legendAside={legendAside} />
      )}
    </section>
  );
}

/** The "no API calls yet" line for the card's empty state. */
function UsageCardEmpty({ title = "No API calls yet", children }: { title?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <>
      <p className="text-body-sm text-fg">{title}</p>
      {children && <p className="max-w-xs text-caption text-fg-muted">{children}</p>}
    </>
  );
}

/** A card title that doubles as its menu: the glyph and name, opening a list of the options with a line each. */
function BreakdownPicker<B extends string>({ options, value, onValueChange, label = "Break usage down by" }: { options: UsageBreakdown<B>[]; value: B; onValueChange: (value: B) => void; label?: string }) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value) ?? options[0];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-label={`${label}: ${selected.label}`}
          className="flex h-8 shrink-0 items-center gap-2 rounded-control pr-2 pl-1.5 outline-none transition-colors duration-150 hover:bg-wash-hover focus-visible:ring-2 focus-visible:ring-focus-ring data-[state=open]:bg-wash-hover"
        >
          {/* Status's bars stand on their bottom row, so they sit low beside the label. */}
          <StillGlyph name={selected.glyph} dense className={cn("size-4 shrink-0 text-brand", selected.glyph === "status" && "-translate-y-px")} />
          <span className="text-body-sm leading-none">{selected.label}</span>
          <ChevronDown className="size-3.5 text-fg-subtle" strokeWidth={1.5} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1.5">
        <ul role="listbox" aria-label={label} className="flex flex-col gap-0.5">
          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onValueChange(o.value);
                    setOpen(false);
                  }}
                  className={cn("relative flex w-full items-center gap-2 rounded-control px-2.5 py-1.5 text-left leading-5 outline-none transition-colors duration-150 hover:bg-wash-hover focus-visible:bg-wash-hover", isSelected && "bg-wash-hover")}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-control border border-line">
                    <StillGlyph name={o.glyph} dense className="size-5 text-brand" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-sm text-fg">{o.label}</span>
                    <span className="block truncate text-caption text-fg-subtle">{o.description}</span>
                  </span>
                  <Check className={cn("size-3.5 shrink-0 text-brand", !isSelected && "invisible")} strokeWidth={1.75} />
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export { BreakdownPicker, UsageCard, UsageCardEmpty };
