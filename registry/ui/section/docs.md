---
name: section
type: ui
version: 1.1.0
use_for: The outer shell of every block. Surface, ruled center column with dot nodes, vertical rhythm, data-ds-block.
never:
  - A block without a Section root
  - Surfaces other than white, blue, black
  - Drawing your own rules or dividers; Section draws them
  - Padding on the section itself; use spacing
props: block, surface?, spacing?, divider?, heading?, id?, children
variants: []
dependencies: [cx]
example: section.example.tsx
---

Every block renders one `Section` as its root. It sets `data-ds-block` (the check and the review read
page structure from it), the flat surface, and the site's rulers: the column's two hairline edges, a
full-bleed rule along the top, and a solid dot where they cross. Pass the block's heading as `heading`
and Section puts a second rule with dot nodes between the heading and the content, as the site does.
`divider={false}` drops the top rule (first section under the nav). `SectionRule` is exported for a
rule inside a block.
