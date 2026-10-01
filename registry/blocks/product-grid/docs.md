---
name: product-grid
type: block
version: 1.2.0
use_for: The four core APIs as a 2x2 grid of ringed cards, plus a row of links to the rest of the API.
never:
  - More or fewer than 4 cards
  - Icons or screenshots instead of dot drawings
  - More than 3 chips per card
  - Filled buttons on the cards
props: title, highlight?, sub?, products ({ name, href, description, tags (max 3), scene (a dot-story scene name)}[]), more? ({ label, href }[])
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, card, button, chip, dot-story, dot-engine, blog-cover, ring-backdrop]
example: product-grid.example.tsx
---

Each card says what the API returns in one sentence, names up to three jobs as chips and shows the
animated dot scene of the output. Everything else in the API goes in the "Also in the API" row.
