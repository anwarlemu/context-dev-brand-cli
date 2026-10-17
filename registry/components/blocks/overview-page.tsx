"use client";

import * as React from "react";

import { AppShell } from "@/components/blocks/app-shell";
import type { ChartBucket, ChartSeries } from "@/components/product/bar-chart";
import { BarChart } from "@/components/product/bar-chart";
import { GEM_GLYPH } from "@/components/product/credits-menu";
import { CardLink, CenteredCard, CenteredNumber, GlyphCard } from "@/components/product/glyph-card";
import { PageColumn, PageHeader, PageRise } from "@/components/product/page";
import { KeyField, QuickstartCard, QuickstartStep, SnippetBox } from "@/components/product/quickstart-card";
import { StatCard, StatCardGrid, StatFigure, StatMeter } from "@/components/product/stat-card";
import { type TryApiTab, TryApi } from "@/components/product/try-api";
import { UsageCard, type UsageBreakdown, type UsageRange, type UsageView } from "@/components/product/usage-card";
import { CreditsRemaining, CreditsUsed, UsageBarList, UsageSummaryDialog } from "@/components/product/usage-summary";
import { DotGlyph } from "@/components/ui/dot-glyph";
import { SegmentedControl } from "@/components/ui/segmented-control";

// Sample data in the shape the redesign's overview reads; replace it with your own.
type Range = "7" | "30" | "90";
type Breakdown = "status" | "key" | "path" | "auth";
type Metric = "calls" | "credits";

const RANGES: UsageRange<Range>[] = [
  { value: "7", label: "Last 7 days", short: "7D" },
  { value: "30", label: "Last 30 days", short: "30D" },
  { value: "90", label: "Last 3 months", short: "3M" },
];
const BREAKDOWNS: UsageBreakdown<Breakdown>[] = [
  { value: "status", label: "Status", description: "Calls by response status", glyph: "status" },
  { value: "key", label: "Key", description: "Usage by API key", glyph: "apiKeys" },
  { value: "path", label: "Path", description: "Usage by API endpoint", glyph: "path" },
  { value: "auth", label: "Auth", description: "Calls by key check result", glyph: "auth" },
];
const SERIES: Record<Breakdown, ChartSeries[]> = {
  status: [
    { key: "200", label: "200", color: "var(--ds-color-chart-200)" },
    { key: "202", label: "202", color: "var(--ds-color-chart-202)" },
    { key: "404", label: "404", color: "var(--ds-color-chart-404)" },
    { key: "429", label: "429", color: "var(--ds-color-chart-rate-limited)" },
  ],
  key: [
    { key: "production", label: "Production", color: "var(--ds-color-chart-series-1)" },
    { key: "staging", label: "Staging", color: "var(--ds-color-chart-series-2)" },
  ],
  path: [
    { key: "scrape", label: "Scrape", color: "var(--ds-color-chart-series-1)" },
    { key: "search", label: "Search", color: "var(--ds-color-chart-series-2)" },
    { key: "retrieve", label: "Brand retrieval", color: "var(--ds-color-chart-series-3)" },
    { key: "crawl", label: "Crawl", color: "var(--ds-color-chart-series-4)" },
  ],
  auth: [
    { key: "valid", label: "Valid", color: "var(--ds-color-chart-ok)" },
    { key: "disabled", label: "Disabled", color: "var(--ds-color-chart-401)" },
    { key: "usageExceeded", label: "Usage exceeded", color: "var(--ds-color-chart-402)" },
    { key: "rateLimited", label: "Rate limited", color: "var(--ds-color-chart-rate-limited)" },
  ],
};
const SHARES: Record<Breakdown, number[]> = { status: [0.86, 0.06, 0.05, 0.03], key: [0.78, 0.22], path: [0.52, 0.27, 0.14, 0.07], auth: [0.95, 0.01, 0.01, 0.03] };

function buildView(breakdown: Breakdown, range: Range, metric: Metric): UsageView {
  const weekly = range === "90";
  const count = range === "7" ? 7 : range === "30" ? 30 : 13;
  const series = SERIES[breakdown];
  const perCall = metric === "credits" && (breakdown === "key" || breakdown === "path") ? 3 : 1;
  const buckets: ChartBucket[] = Array.from({ length: count }, (_, i) => {
    const day = new Date(2026, 9, 17 - (count - 1 - i) * (weekly ? 7 : 1));
    const base = (weekly ? 7 : 1) * perCall * Math.round(820 + Math.sin(i / 2.2) * 260 + i * 18);
    const values = Object.fromEntries(series.map((s, j) => [s.key, Math.round(base * SHARES[breakdown][j])]));
    const label = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { label: weekly ? `Week of ${label}` : label, values, total: Object.values(values).reduce((a, b) => a + b, 0) };
  });
  const unit = perCall === 3 ? "credits" : "calls";
  const describes = breakdown === "status" ? "API calls by status" : breakdown === "auth" ? "API calls by key check" : `${unit === "credits" ? "Credits" : "API calls"} by ${breakdown === "key" ? "API key" : "endpoint"}`;
  return { buckets, series, unit, label: `${describes}, ${RANGES.find((r) => r.value === range)?.label.toLowerCase()}` };
}

const TABS: TryApiTab<"scrape" | "search" | "retrieve" | "crawl" | "answers">[] = [
  { value: "scrape", label: "Scrape", glyph: ["22222", "2...2", "22222", "2...2", "22222"], inputKind: "url", inputLabel: "URL to scrape", examples: ["https://stripe.com/pricing", "https://linear.app/changelog"], runLabel: "Scrape, 1 credit" },
  { value: "search", label: "Search", glyph: [".222.", "2...2", "2...2", ".222.", "....2"], inputKind: "query", inputLabel: "Search query", examples: ["best vector databases 2026", "react server components guide"], runLabel: "Search, 1 credit" },
  { value: "retrieve", label: "Brand Retrieval", glyph: ["22.22", "22.22", ".....", "22.22", "22.22"], inputKind: "url", inputLabel: "Domain", examples: ["airbnb.com", "notion.so"], runLabel: "Retrieve, 10 credits" },
  { value: "crawl", label: "Crawl", glyph: ["..2..", ".2.2.", "2...2", ".2.2.", "..2.."], inputKind: "url", inputLabel: "Site to crawl", examples: ["https://docs.github.com"], runLabel: "Crawl, 1 credit a page" },
  { value: "answers", label: "Answers", glyph: ["22222", "2...2", "2...2", "22222", "2...."], inputKind: "query", inputLabel: "Question", examples: ["What does Ramp's latest funding round value it at?"], runLabel: "Ask, 5 credits" },
];

const KEY = "ctx_live_9f2c41b7e0a84d6c3b5e";
type Method = "mcp" | "skill" | "cli";

// The redesigned overview: the try box leads, then the usage chart over the four credit and plan cards on the left
// with the quickstart beside them, filling the same height and scrolling inside when its steps run longer (one
// column when narrow). Cards rise in one after another on the first visit. The Credits remaining card opens the usage
// summary over the page.
export function OverviewPage() {
  const [api, setApi] = React.useState<(typeof TABS)[number]["value"]>("scrape");
  const [input, setInput] = React.useState("");
  const [breakdown, setBreakdown] = React.useState<Breakdown>("status");
  const [range, setRange] = React.useState<Range>("30");
  const [metric, setMetric] = React.useState<Metric>("calls");
  const [method, setMethod] = React.useState<Method>("mcp");
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const [summaryMetric, setSummaryMetric] = React.useState<Metric>("calls");
  const view = React.useMemo(() => buildView(breakdown, range, metric), [breakdown, range, metric]);
  const summaryView = React.useMemo(() => buildView("status", "30", summaryMetric), [summaryMetric]);
  const hasMetric = breakdown === "key" || breakdown === "path";
  const metricSwitch = (value: Metric, onChange: (m: Metric) => void) => (
    <SegmentedControl
      label="Metric"
      size="sm"
      value={value}
      onValueChange={onChange}
      options={[
        { value: "calls", label: "API calls" },
        { value: "credits", label: "Credits" },
      ]}
    />
  );
  return (
    <AppShell active="Overview">
      <PageColumn className="min-h-full shrink-0 gap-3 px-4 pt-2 pb-8 @2xl:px-8">
        <PageHeader title="Overview" description="Try any API, then track what your calls use." className="mb-3" />
        <PageRise index={0} className="mb-3">
          <TryApi tabs={TABS} value={api} onValueChange={setApi} input={input} onInputChange={setInput} onRun={() => {}} aside={<CardLink href="#">API Playground</CardLink>} />
        </PageRise>
        <div className="grid gap-3 @4xl:grid-cols-2 @4xl:grid-rows-[auto_auto]">
          <PageRise index={2} className="min-h-0">
            <UsageCard
              breakdowns={BREAKDOWNS}
              breakdown={breakdown}
              onBreakdownChange={setBreakdown}
              ranges={RANGES}
              range={range}
              onRangeChange={setRange}
              view={view}
              legendAside={hasMetric && metricSwitch(metric, setMetric)}
            />
          </PageRise>
          <PageRise index={3} className="min-h-0 @4xl:row-span-2 @4xl:[contain:size]">
            <QuickstartCard aside={<CardLink href="#">Manage keys</CardLink>}>
              <QuickstartStep number={1} title="Copy your API key">
                <KeyField secret={KEY} name="Default" />
              </QuickstartStep>
              <QuickstartStep number={2} title="Onboard your agent">
                <SnippetBox
                  label="Setup method"
                  value={method}
                  onValueChange={setMethod}
                  snippets={[
                    { value: "mcp", label: "MCP", code: "claude mcp add --transport http context-dev https://mcp.context.dev/mcp", note: "Run it in your terminal, then sign in when the browser opens." },
                    { value: "skill", label: "Skill", code: "claude plugin install context-dev" },
                    { value: "cli", label: "CLI", code: `npm i -g @context-dev/cli && context login --key ${KEY.slice(0, 14)}••••••••••••`, copy: `npm i -g @context-dev/cli && context login --key ${KEY}` },
                  ]}
                />
              </QuickstartStep>
              <QuickstartStep number={3} title="Prompt">
                <div className="rounded-control border border-line px-3 py-2.5 text-body-sm leading-relaxed text-pretty text-fg">
                  Use the context-dev MCP server to scrape, search and crawl the web whenever a task needs live information.
                </div>
              </QuickstartStep>
            </QuickstartCard>
          </PageRise>
          <PageRise index={4}>
            <StatCardGrid label="Credits and plan">
              <StatCard title="Credits used today" footer="1,204 API calls">
                <StatFigure>2,318</StatFigure>
              </StatCard>
              <StatCard title="Credits used this month" footer="41,880 API calls">
                <StatFigure>58,410</StatFigure>
              </StatCard>
              <StatCard title="Credits remaining" footer="Resets Nov 1" onClick={() => setSummaryOpen(true)}>
                <span className="flex flex-col gap-2">
                  <StatFigure suffix="/100K">41,590</StatFigure>
                  <StatMeter value={41590} max={100000} />
                </span>
              </StatCard>
              <StatCard title="Current plan" footer="100K credits/mo · 600 req/min" onClick={() => {}}>
                <span className="flex items-center gap-2">
                  <DotGlyph rows={GEM_GLYPH} className="size-4 shrink-0 text-brand" />
                  <span className="truncate text-body-sm font-medium text-fg">Pro</span>
                </span>
              </StatCard>
            </StatCardGrid>
          </PageRise>
        </div>
      </PageColumn>
      <UsageSummaryDialog open={summaryOpen} onOpenChange={setSummaryOpen} description="On the Pro plan, resetting Nov 1." footer={<CardLink href="#">See full usage</CardLink>}>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <CreditsRemaining remaining={41590} total={100000} />
          <CreditsUsed today={2318} month={58410} />
        </div>
        <div className="mt-2 grid gap-3 @xl:grid-cols-3">
          <div className="@container grid">
            <CenteredCard label="API calls" badge="Last 30 days" visual={<CenteredNumber value="41,880" />} />
          </div>
          <div className="@container grid">
            <CenteredCard label="Credits used" badge="1,947 a day" visual={<CenteredNumber value="58,410" />} />
          </div>
          <div className="@container grid">
            <CenteredCard label="Successful calls" badge="1,256 errors" visual={<CenteredNumber value="97.00" suffix="%" />} />
          </div>
        </div>
        <GlyphCard glyph="usage" title={summaryMetric === "calls" ? "API calls per day" : "Credits per day"} aside={metricSwitch(summaryMetric, setSummaryMetric)} className="h-52">
          <BarChart buckets={summaryView.buckets} series={summaryView.series} unit={summaryView.unit} label={summaryView.label} />
        </GlyphCard>
        <UsageBarList
          className="mt-2"
          title="Top APIs this month"
          items={[
            { key: "scrape", label: "Scrape", value: 30410 },
            { key: "retrieve", label: "Brand retrieval", value: 15820 },
            { key: "search", label: "Search", value: 8960 },
          ]}
        />
      </UsageSummaryDialog>
    </AppShell>
  );
}
