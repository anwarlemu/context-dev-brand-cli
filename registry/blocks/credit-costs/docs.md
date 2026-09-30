---
name: credit-costs
type: block
version: 1.0.0
use_for: What each API costs in credits, grouped by product area, as tables.
never:
  - Cards for this data; it is a table
  - Costs that differ from the billing system
  - Footnotes in place of an optional charge column
props: title, highlight?, sub?, groups ({ title, rows ({ api, description, cost }[]) }[])
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, table]
example: credit-costs.example.tsx
---

One table per group: Web extraction, Brand intelligence, People and news, Utility. Costs are
right-aligned with tabular figures. Put optional charges in the description, in plain words.
