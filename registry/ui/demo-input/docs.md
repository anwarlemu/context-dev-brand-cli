---
name: demo-input
type: ui
version: 1.0.0
use_for: The homepage hero demo. Pick a job (Scrape, Search, Research, Crawl, Map, Brand) and type a URL or question.
never:
  - More than one per page; it belongs in the centered hero, on the blue dot-panel
  - Changing the jobs or their dot glyphs by hand; re-run scripts/port-demo.mjs from the site
  - A second filled button next to it
props: action? (URL a run goes to, default /signup)
variants: []
dependencies: [cx]
export: DemoInput
example: demo-input.example.tsx
---

Ported from the live site by `scripts/port-demo.mjs`. Each job tab carries a 5x5 dot glyph (solid
and hollow dots) and the active tab's label expands on a spring. The placeholder types example
inputs in Doto, the data face, and pauses on focus, offscreen and with reduced motion. Submitting
navigates to `action` with `type`, and `url`, `domain`, `query` or `task`, as search params.
