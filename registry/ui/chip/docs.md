---
name: chip
type: ui
version: 1.0.0
use_for: Small tags under a card title ("Fresh sources for RAG") and "Also in the API" links.
never:
  - Chips as buttons for primary actions
  - More than 3 chips under one card title
  - Colored fills
props: href?, tone? (default | on-brand), children
variants: []
dependencies: [cx]
example: chip.example.tsx
---

Neutral pill with a 1px border. With `href` it becomes a link that turns blue on hover.
