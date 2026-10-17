"use client";

import { useState } from "react";

import { BarChart } from "@/components/product/bar-chart";
import type { ChartBucket } from "@/components/product/line-chart";
import { Card, CardTitle } from "@/components/ui/card";

type K = "scrape" | "search" | "crawl";
const SERIES = [
  { key: "scrape" as const, label: "Scrape", color: "var(--ds-color-chart-series-1)" },
  { key: "search" as const, label: "Search", color: "var(--ds-color-chart-series-2)" },
  { key: "crawl" as const, label: "Crawl", color: "var(--ds-color-chart-series-3)" },
];
const BUCKETS: ChartBucket<K>[] = Array.from({ length: 21 }, (_, i) => {
  const scrape = Math.round(600 + Math.sin(i / 2) * 250 + i * 30);
  const search = Math.round(300 + Math.cos(i / 3) * 120);
  const crawl = Math.round(90 + (i % 5) * 25);
  return { label: `Oct ${i + 1}`, total: scrape + search + crawl, values: { scrape, search, crawl } };
});

export function Product() {
  const [focus, setFocus] = useState<K | undefined>();
  return (
    <Card className="h-72 w-full max-w-2xl">
      <CardTitle className="text-body-sm">Requests by kind</CardTitle>
      <BarChart buckets={BUCKETS} series={SERIES} unit="requests" label="Requests by kind over 21 days" focusKey={focus} onFocusChange={setFocus} />
    </Card>
  );
}
