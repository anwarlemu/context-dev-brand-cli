---
name: benchmark
type: block
version: 1.0.0
use_for: The proof that Context.dev is better and cheaper. Tabs of metrics, each a dot bar chart against named competitors.
never:
  - A number without sourceHref pointing at the published comparison
  - Bars from a charting library; bars are dot columns
  - Coloring competitors; they are hollow, ours is solid
  - Rounding in our favor
props: title, highlight?, sub?, ours (provider name), metrics ({ id, label, unit, higherIsBetter, groups ({ name, values ({ provider, value }[]) }[]) }[]), sourceLabel, sourceHref
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, tabs, dot-grid]
example: benchmark.example.tsx
---

Our column is solid dots, competitors are hollow: the brand story as a chart. Every figure must
come from the published comparison at `sourceHref`. Keep to three groups per metric.
