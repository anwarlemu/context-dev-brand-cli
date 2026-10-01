---
name: benchmark
type: block
version: 1.2.0
use_for: The proof that Context.dev is better and cheaper. The live site's benchmark panel, with a sourced feature table while the figures are unverified.
never:
  - Shipping sample figures; set data.status to verified only with published results
  - A figure without sourceHref pointing at the published comparison
  - Coloring competitors; Context is brand blue, the rest neutral
  - Rounding in our favor
props: "title, highlight? (phrase inside title), sub?, data? (BenchmarkData from benchmark-data; defaults to the bundled sample), sourceLabel, sourceHref"
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, benchmark-chart]
example: benchmark.example.tsx
---

Renders the ported benchmark panel (tabs, dot meters, Doto values, provider logos). The bundled
figures are the site's placeholders (`status: 'sample'`): they show in development and are replaced
by the feature table in production builds, so no unverified number ships. Pass `data` with real
results and `status: 'verified'` to show the charts everywhere.
