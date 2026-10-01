---
name: trust-mark
type: ui
version: 1.1.0
use_for: "Animated dot marks for the trust cards: SOC 2, security policies, security controls."
never:
  - Icons from an icon set in trust cards
props: "mark (compliance | policies | controls)"
variants: []
dependencies: [dot-engine, cx]
example: trust-mark.example.tsx
---

Morphs on hover. Use one per trust card, in the order the trust grid gives.
