---
name: card
type: ui
version: 1.0.0
use_for: The ringed card. White card inside a blue 10 ring, or a blue card inside a blue 80 ring.
never:
  - Shadows, gradients or glass
  - Gray card fills
  - Cards nested in cards
props: tone? (white | blue), padding? (default | none), children
variants: []
dependencies: [cx]
example: card.example.tsx
---

Every card on the site is this one component. `white` for content cards, `blue` for the one
recommended or featured card in a group. `padding="none"` when the card holds an edge-to-edge panel.
