---
name: credits-dot-number
type: ui
version: 1.0.0
use_for: "A figure drawn in dots that morphs into Doto, such as 1,000 free credits or a step number."
never:
  - More than one per view
  - Figures without a source
props: "value, morphTo?, sideColumns?, className?"
variants: []
dependencies: [cx]
example: credits-dot-number.example.tsx
---

Use for the one figure a section is about. In steps, `value` is the number and `morphTo` the word.
