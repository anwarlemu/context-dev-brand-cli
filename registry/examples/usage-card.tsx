"use client";

import { useState } from "react";

import type { ChartBucket } from "@/components/product/bar-chart";
import { UsageCard, UsageCardEmpty } from "@/components/product/usage-card";

const SERIES = {
  status: [
    { key: "200", label: "200", color: "var(--ds-color-chart-200)" },
    { key: "404", label: "404", color: "var(--ds-color-chart-404)" },
    { key: "429", label: "429", color: "var(--ds-color-chart-rate-limited)" },
  ],
  auth: [
    { key: "valid", label: "Valid", color: "var(--ds-color-chart-ok)" },
    { key: "rateLimited", label: "Rate limited", color: "var(--ds-color-chart-rate-limited)" },
  ],
};

function bucketsFor(keys: string[], days: number): ChartBucket[] {
  return Array.from({ length: days }, (_, i) => {
    const base = Math.round(700 + Math.sin(i / 2) * 220 + i * 12);
    const values = Object.fromEntries(keys.map((k, j) => [k, Math.round(base * (j === 0 ? 0.9 : 0.1 / (keys.length - 1)))]));
    return { label: new Date(2026, 9, 17 - (days - 1 - i)).toLocaleDateString("en-US", { month: "short", day: "numeric" }), values, total: Object.values(values).reduce((a, b) => a + b, 0) };
  });
}

const BREAKDOWNS = [
  { value: "status" as const, label: "Status", description: "Calls by response status", glyph: "status" as const },
  { value: "auth" as const, label: "Auth", description: "Calls by key check result", glyph: "auth" as const },
];
const RANGES = [
  { value: "7" as const, label: "Last 7 days", short: "7D" },
  { value: "30" as const, label: "Last 30 days", short: "30D" },
];

export function Product() {
  const [breakdown, setBreakdown] = useState<"status" | "auth">("status");
  const [range, setRange] = useState<"7" | "30">("30");
  const series = SERIES[breakdown];
  return (
    <div className="w-full max-w-xl">
      <UsageCard
        breakdowns={BREAKDOWNS}
        breakdown={breakdown}
        onBreakdownChange={setBreakdown}
        ranges={RANGES}
        range={range}
        onRangeChange={setRange}
        view={{ buckets: bucketsFor(series.map((s) => s.key), Number(range)), series, unit: "calls", label: `API calls by ${breakdown}, last ${range} days` }}
      />
    </div>
  );
}

export function Empty() {
  return (
    <div className="w-full max-w-xl">
      <UsageCard
        breakdowns={BREAKDOWNS}
        breakdown="status"
        onBreakdownChange={() => {}}
        ranges={RANGES}
        range="30"
        onRangeChange={() => {}}
        view={{ buckets: [], series: [], unit: "calls", label: "API calls" }}
        empty={
          <UsageCardEmpty>
            Run one above or in the{" "}
            <a href="#" className="text-fg-brand hover:underline">
              playground
            </a>{" "}
            and your usage fills in here.
          </UsageCardEmpty>
        }
      />
    </div>
  );
}
