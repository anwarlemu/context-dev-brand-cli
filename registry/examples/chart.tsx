"use client";

import { AreaChart, BarChart, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, LineChart, PieChart, type ChartConfig } from "@/components/ui/chart";

const DAYS = [
  { day: "Oct 1", scrape: 1840, crawl: 620, search: 410 },
  { day: "Oct 2", scrape: 2210, crawl: 540, search: 520 },
  { day: "Oct 3", scrape: 1980, crawl: 910, search: 480 },
  { day: "Oct 4", scrape: 2640, crawl: 760, search: 690 },
  { day: "Oct 5", scrape: 3120, crawl: 1080, search: 720 },
  { day: "Oct 6", scrape: 2890, crawl: 980, search: 810 },
  { day: "Oct 7", scrape: 3460, crawl: 1240, search: 950 },
];

const config = {
  scrape: { label: "Scrape" },
  crawl: { label: "Crawl" },
  search: { label: "Search" },
} satisfies ChartConfig;

export function Site() {
  return (
    <ChartContainer config={{ scrape: { label: "Pages scraped" } }} className="w-full max-w-2xl">
      <AreaChart data={DAYS} index="day" keys={["scrape"]} aria-label="Pages scraped per day" />
      <ChartTooltip content={<ChartTooltipContent />} />
    </ChartContainer>
  );
}

export function Product() {
  return (
    <ChartContainer config={config} className="w-full max-w-2xl rounded-card bg-surface px-5 py-4 shadow-card">
      <BarChart data={DAYS} index="day" stacked aria-label="Calls per day by API" />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

export function Line() {
  return (
    <ChartContainer config={config} className="w-full max-w-2xl">
      <LineChart data={DAYS} index="day" dots aria-label="Calls per day by API" />
      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

export function Grouped() {
  return (
    <ChartContainer config={config} className="w-full max-w-2xl">
      <BarChart data={DAYS.slice(-4)} index="day" aria-label="Calls in the last four days" />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

const CODES = [
  { code: "ok", calls: 18420 },
  { code: "clientError", calls: 640 },
  { code: "serverError", calls: 85 },
];

export function Donut() {
  return (
    <ChartContainer
      config={{ ok: { label: "2xx", color: "var(--ds-color-chart-ok)" }, clientError: { label: "4xx", color: "var(--ds-color-chart-client-error)" }, serverError: { label: "5xx", color: "var(--ds-color-chart-server-error)" } }}
      className="aspect-square w-full max-w-xs"
    >
      <PieChart data={CODES} index="code" value="calls" aria-label="Responses by status" />
      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
      <ChartLegend content={<ChartLegendContent className="justify-center" />} />
    </ChartContainer>
  );
}
