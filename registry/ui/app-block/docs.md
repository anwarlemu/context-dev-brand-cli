---
name: app-block
type: ui
surface: product
version: 1.0.0
use_for: The root element of every product block (app-*). Names the block and opts it into the first-visit entrance.
never:
  - Using it inside marketing pages; marketing blocks root at Section
  - A riseIndex on anything after the first screen of a page; the entrance is for the first visit only
props: block, riseIndex?, className?, children
dependencies: [cx]
example: app-block.example.tsx
---

Product blocks are cards and panels inside the app shell, not page-wide ruled sections, so they root
at `AppBlock` instead of `Section`. `riseIndex` staggers cards 50ms apart with `rise-in` (opacity and
8px of rise, 400ms, reduced motion keeps only the fade). Put `data-entered` on the page once the
entrance has played so returning to the page does not replay it.
