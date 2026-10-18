import { SiteSection } from "@/components/site/section";
import { ArrowRight, Flame, Hexagon, Layers, Search } from "lucide-react";

import { BenchmarkPanel, type BenchmarkData, type BenchmarkProvider } from "@/components/site/competitor-charts";

// Each provider's own logo goes here (an <img> or an svg); these icons stand in for them.
const PROVIDERS: BenchmarkProvider[] = [
  { key: "context", name: "Context.dev", logo: <Hexagon />, highlight: true },
  { key: "firecrawl", name: "Firecrawl", logo: <Flame /> },
  { key: "exa", name: "Exa", logo: <Search /> },
  { key: "parallel", name: "Parallel", logo: <Layers /> },
];

// The branch's sample numbers, for layout only: no benchmark has been run. Ship real results only.
const BENCHMARKS: BenchmarkData = {
  successRate: {
    groups: ["Bot-protected", "JS-rendered", "Long-tail"],
    values: { context: [94, 97, 92], firecrawl: [78, 93, 88], exa: [41, 71, 84], parallel: [62, 88, 90] },
  },
  latency: { context: 1.1, firecrawl: 3.9, exa: 1.4, parallel: 5.6 },
  costVsSuccess: {
    context: { cost: 0.79, success: 94 },
    firecrawl: { cost: 4.95, success: 86 },
    exa: { cost: 1, success: 65 },
    parallel: { cost: 1.5, success: 80 },
  },
};

export function Site() {
  return (<SiteSection>
    <BenchmarkPanel
      className="w-full"
      providers={PROVIDERS}
      data={BENCHMARKS}
      link={
        <a href="https://context.dev/compare/the-top-firecrawl-alternative" className="inline-flex shrink-0 items-center gap-1 rounded-card py-2 text-body-sm font-medium text-fg-brand/85 transition-[color] duration-150 ease-out hover:text-fg-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring motion-reduce:transition-none">
          See full comparisons
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </a>
      }
    />
  </SiteSection>);
}
