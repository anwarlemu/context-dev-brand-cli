---
name: ring-backdrop
type: ui
version: 1.0.0
use_for: "A faint field of hollow rings behind art or a card, clipped to whole rings."
never:
  - Behind body text
  - Opacity above 0.3
props: "color (a token var), opacity, pitch?, ringRadius?, className?"
variants: []
dependencies: [cx]
example: ring-backdrop.example.tsx
---

Pass a token as `color`, for example `var(--ds-color-white)` on blue or `var(--ds-color-brand)` on white.
