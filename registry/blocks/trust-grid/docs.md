---
name: trust-grid
type: block
version: 1.1.0
use_for: Security and reliability for the buyer who spends 100k. Three cards and a link to the trust center.
never:
  - Claims without an audit, policy or status page behind them
  - Badge walls or shield icons
  - More than 3 cards
props: title, highlight?, items ({ title, description, mark (compliance | retention | reliability), href? }[], 3), cta { label, href }
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, card, button, trust-mark, dot-engine]
example: trust-grid.example.tsx
---

Each card is one verifiable fact with a link to the evidence. Each card carries its
animated trust mark, which morphs on hover.
