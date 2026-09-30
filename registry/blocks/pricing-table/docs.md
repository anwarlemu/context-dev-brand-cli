---
name: pricing-table
type: block
version: 1.0.0
use_for: The plan comparison on the pricing page. One column per plan, price, credits, limits, one action each.
never:
  - More than one filled action; only the recommended plan's action is primary
  - Hidden prices, except Custom for Enterprise
  - Feature lists longer than 8 lines per plan
  - Plans that differ from what billing actually sells
props: variant?, plans ({ id, name, for, price, period?, action { label, href }, features[] }[]), recommended? (plan id), note?
variants: [monthly]
copy_rules: voice.md#mechanics
dependencies: [section, button, badge, cx]
example: pricing-table.example.tsx
---

The recommended plan gets the blue tint, a "Popular" badge and the only filled action on the page.
Every other plan uses an outline action. Keep features to the same lines in the same order in every
column so people can compare across.
