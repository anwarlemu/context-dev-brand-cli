"use client";

import { BarChart, type ChartBucket, useSeriesSelection } from "@/components/product/bar-chart";

type K = "200" | "404" | "429";
const SERIES = [
  { key: "200" as const, label: "200 OK", color: "var(--ds-color-chart-200)" },
  { key: "404" as const, label: "404 Not found", color: "var(--ds-color-chart-404)" },
  { key: "429" as const, label: "429 Rate limited", color: "var(--ds-color-chart-rate-limited)" },
];
const BUCKETS: ChartBucket<K>[] = Array.from({ length: 30 }, (_, i) => {
  const ok = Math.round(600 + Math.sin(i / 2) * 250 + i * 30);
  const missing = Math.round(40 + Math.cos(i / 3) * 20);
  const limited = i % 6 === 0 ? 35 : 0;
  return { label: new Date(2026, 8, 18 + i).toLocaleDateString("en-US", { month: "short", day: "numeric" }), total: ok + missing + limited, values: { "200": ok, "404": missing, "429": limited } };
});

export function Product() {
  const { fadedKeys, selectSeries } = useSeriesSelection(SERIES);
  return (
    <section className="flex h-64 w-full max-w-2xl flex-col rounded-card bg-surface p-2 shadow-card">
      <BarChart buckets={BUCKETS} series={SERIES} unit="calls" label="API calls by status, last 30 days" fadedKeys={fadedKeys} onSeriesSelect={selectSeries} />
    </section>
  );
}
