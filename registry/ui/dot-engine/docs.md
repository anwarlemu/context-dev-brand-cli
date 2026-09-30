---
name: dot-engine
type: ui
version: 1.0.0
use_for: "The shared dot animation engine: eased hollow and solid dots, liquid fusion, glyph morphs, story timing. Used by every animated dot item."
never:
  - Importing it directly in a page; use the components built on it
  - Painting colors that are not tokens
props: "none; library code"
variants: []
dependencies: [cx]
export: resolveColor
example: dot-engine.example.tsx
---

Installed as a dependency of dot-story, blog-cover, trust-mark, customer-logo-dots, credits-dot-number,
footer-watermark, hero-dot-field and announcement-dot-strip. Token colors given as var(--ds-...)
are resolved for canvas paint by `resolveColor`. Offscreen luminance masks are marked with ds-override.
