---
name: benchmark-chart
type: ui
version: 1.0.0
use_for: "The homepage benchmark panel from context.dev: tabs for success rate, latency and cost vs success, drawn as dot meters over a ring backdrop, with values in Doto."
never:
  - Shipping the bundled sample figures; pass verified data or render BenchmarkComparison
  - Coloring competitors; Context is brand blue, everyone else a neutral, each named by logo and label
  - Bars from a charting library
  - Figures without the sourceHref comparison link
props: "BenchmarkPanel: data? (BenchmarkData, default the bundled sample), sourceHref?, sourceLabel?. BenchmarkComparison: no props"
variants: []
dependencies: [ring-backdrop, cx]
npm: [motion@^12]
export: BenchmarkPanel
example: benchmark-chart.example.tsx
---

Ported from the live homepage by `scripts/port-benchmark.mjs`. Each tab grows its dots in once on
screen and the panel cycles tabs every 6 seconds, pausing while a mark is hovered or focused.
Values are Doto: the figure is the claim. `BENCHMARKS.status` is `sample` until real results
replace it; the benchmark block then shows `BenchmarkComparison` (sourced features) in production.
