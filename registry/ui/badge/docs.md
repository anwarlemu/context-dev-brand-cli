---
name: badge
type: ui
version: 1.0.0
use_for: A one or two word status next to a title ("Recommended", "Beta").
never:
  - Badges stacked above a headline
  - More than one badge per title
  - Sentences in a badge
props: tone?, children
variants: [brand, neutral, on-brand, success]
dependencies: [cx]
example: badge.example.tsx
---

Use `tone` for the color: `brand` on white, `on-brand` on a blue card, `success` for live status.
