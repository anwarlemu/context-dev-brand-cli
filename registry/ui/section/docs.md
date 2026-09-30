---
name: section
type: ui
version: 1.0.0
use_for: The outer shell of every block. Surface, ruled center column, vertical rhythm, data-ds-block.
never:
  - A block without a Section root
  - Surfaces other than white, blue, black
  - Padding on the section itself; use spacing
props: block, surface?, spacing?, divider?, id?, children
variants: []
dependencies: [cx]
example: section.example.tsx
---

Every block renders one `Section` as its root, which sets `data-ds-block` (the check and the review
use it to read page structure), the flat surface, the ruled 6xl column and the section divider.
`surface`: white (default), blue, black. `spacing`: default, tight (bars, logo rows), none.
