---
name: use-case-grid
type: block
version: 1.1.0
use_for: What teams build with the API. Two or six ringed cards in a two-column grid, each with a dot drawing.
never:
  - An odd number of cards
  - Icons, screenshots or stock art instead of dot drawings
  - Use cases the API cannot do today
props: title, highlight?, sub?, cases ({ title, description, scene (a dot-story scene name)}[], 2, 4 or 6)
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, card, dot-story, dot-engine, blog-cover, ring-backdrop]
example: use-case-grid.example.tsx
---

Titles are jobs ("Run batches at scale"), not product names. Keep an even count so the grid has
no orphan card.
