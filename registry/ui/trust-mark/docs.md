---
name: trust-mark
type: ui
version: 1.0.0
use_for: "Animated dot marks for the trust cards: SOC 2, zero data retention, uptime."
never:
  - Icons from an icon set in trust cards
props: "mark (compliance | retention | reliability)"
variants: []
dependencies: [dot-engine, cx]
example: trust-mark.example.tsx
---

Morphs on hover. Use one per trust card, in the order the trust grid gives.
