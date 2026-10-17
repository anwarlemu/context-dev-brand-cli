"use client";

import { type ChartBucket, LineChart } from "@/components/product/line-chart";
import { Card, CardTitle } from "@/components/ui/card";

type K = "scrape" | "search";
const SERIES = [
  { key: "scrape" as const, label: "Scrape", color: "var(--ds-color-chart-series-1)" },
  { key: "search" as const, label: "Search", color: "var(--ds-color-chart-series-2)" },
];
const BUCKETS: ChartBucket<K>[] = Array.from({ length: 14 }, (_, i) => {
  const scrape = Math.round(800 + Math.sin(i / 2) * 300 + i * 40);
  const search = Math.round(400 + Math.cos(i / 3) * 150 + i * 20);
  return { label: `Oct ${i + 3}`, total: scrape + search, values: { scrape, search } };
});

export function Product() {
  return (
    <Card className="h-72 w-full max-w-2xl">
      <CardTitle className="text-body-sm">Requests</CardTitle>
      <LineChart buckets={BUCKETS} series={SERIES} unit="requests" label="Requests over 14 days" headline="+18% this week" />
    </Card>
  );
}
