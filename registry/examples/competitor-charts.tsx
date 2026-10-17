import { ArrowRight, Flame, Hexagon, Layers, Search } from "lucide-react";

import { BenchmarkPanel, type BenchmarkData, type BenchmarkProvider } from "@/components/site/competitor-charts";

// Each provider's own logo goes here (an <img> or an svg); these icons stand in for them.
const PROVIDERS: BenchmarkProvider[] = [
  { key: "context", name: "Context", logo: <Hexagon />, highlight: true },
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
  return (
    <BenchmarkPanel
      className="w-full"
      providers={PROVIDERS}
      data={BENCHMARKS}
      link={
        <a href="/compare/the-top-firecrawl-alternative" className="group/compare inline-flex items-center gap-1 py-2 text-body-sm font-medium text-fg-brand">
          See full comparisons
          <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-200 ease-out group-hover/compare:translate-x-0.5 motion-reduce:transition-none" />
        </a>
      }
    />
  );
}
