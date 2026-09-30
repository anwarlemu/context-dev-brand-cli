---
name: customer-logo-dots
type: ui
version: 1.0.0
use_for: "A customer logo sampled into the dot grid, white on a blue story card."
never:
  - Raw logo images on story cards
  - Logos without permission to use them
props: "src (logo image URL, same origin), background?, className?"
variants: []
dependencies: [dot-engine, cx]
example: customer-logo-dots.example.tsx
---

Samples the image at runtime into dots and morphs on hover. Falls back to the plain image if sampling fails.
