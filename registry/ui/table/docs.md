---
name: table
type: ui
version: 1.0.0
use_for: "Data that people compare across rows: credit costs, plan limits, benchmark numbers. Tables, not cards, for data."
never:
  - Cards for tabular data
  - Zebra stripes or colored rows
  - Numbers left-aligned
props: caption, columns ({ key, label, align? }[]), rows (Record<key, node>[])
variants: []
dependencies: [cx]
example: table.example.tsx
---

Ringed like a card. Numbers use tabular figures and align right.
