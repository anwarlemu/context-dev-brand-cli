"use client";

import { AppShell } from "@/components/blocks/app-shell";
import { CodeCard } from "@/components/product/code-card";
import { type ChartBucket, LineChart } from "@/components/product/line-chart";
import { PageColumn, PageHeader, PageSection } from "@/components/product/page";
import { StatCard, StatFigure, StatMeter } from "@/components/product/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type Kind = "scrape" | "search" | "crawl";
const SERIES = [
  { key: "scrape" as const, label: "Scrape", color: "var(--ds-color-chart-series-1)" },
  { key: "search" as const, label: "Search", color: "var(--ds-color-chart-series-2)" },
  { key: "crawl" as const, label: "Crawl", color: "var(--ds-color-chart-series-3)" },
];
const BUCKETS: ChartBucket<Kind>[] = Array.from({ length: 14 }, (_, i) => {
  const scrape = Math.round(800 + Math.sin(i / 2) * 300 + i * 40);
  const search = Math.round(400 + Math.cos(i / 3) * 150 + i * 20);
  const crawl = Math.round(120 + (i % 4) * 30);
  return { label: `Oct ${i + 3}`, total: scrape + search + crawl, values: { scrape, search, crawl } };
});

// The product's overview: the page header with the main action, usage over time, four stat cards, and the
// quickstart call.
export function OverviewPage() {
  return (
    <AppShell active="Overview">
      <PageColumn>
        <PageHeader title="Overview" description="Your usage, credits and the fastest way to make a call." action={<Button>Make a request</Button>} />
        <Card className="h-72">
          <CardTitle className="text-body-sm">Requests</CardTitle>
          <LineChart buckets={BUCKETS} series={SERIES} unit="requests" label="Requests over the last 14 days" headline="+18% this week" />
        </Card>
        <div className="grid gap-3 md:grid-cols-2">
          <StatCard title="Credits used today" footer="1,204 API calls">
            <StatFigure>2,318</StatFigure>
          </StatCard>
          <StatCard title="Credits used this month" footer="41,880 API calls">
            <StatFigure>58,410</StatFigure>
          </StatCard>
          <StatCard title="Credits remaining" footer="Resets Nov 1" interactive>
            <span className="flex flex-col gap-2">
              <StatFigure suffix="/100K">41,590</StatFigure>
              <StatMeter value={41590} max={100000} />
            </span>
          </StatCard>
          <StatCard title="Current plan" footer="100K credits/mo · 600 req/min" interactive>
            <span className="text-body-sm font-medium text-fg">Pro</span>
          </StatCard>
        </div>
        <PageSection title="Quickstart">
          <CodeCard
            samples={[
              { language: "TypeScript", code: `import ContextDev from 'context.dev';\n\nconst client = new ContextDev({ apiKey: process.env.CONTEXT_API_KEY });\nconst page = await client.scrape({ url: 'https://acme.com', format: 'markdown' });\nconsole.log(page.markdown);` },
              { language: "cURL", code: `curl https://api.context.dev/v1/scrape \\\n  -H "Authorization: Bearer $CONTEXT_API_KEY" \\\n  -d '{"url": "https://acme.com", "format": "markdown"}'` },
            ]}
          />
        </PageSection>
      </PageColumn>
    </AppShell>
  );
}
