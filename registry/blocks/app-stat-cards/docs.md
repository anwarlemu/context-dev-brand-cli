---
name: app-stat-cards
type: block
surface: product
version: 1.0.1
use_for: A few headline figures as small cards, two by two (credits used, remaining, plan). Each card that leads somewhere is a link.
never:
  - Figures in Doto, colored or bold beyond medium; figures are Rethink Sans medium, tabular
  - Title Case labels ("Credits Used Today"); labels are sentence case
  - Icons, sparklines or trend arrows in green and red; one figure, one footer line
  - More than four cards, or a hover lift; a linked card answers hover with the glass ring
props: "stats [{ label, value, suffix?, footer?, href?, meter? { value, total } }], riseIndex?"
states: [default, hover, focus]
copy_rules: voice.md#mechanics
dependencies: [cx, app-block]
npm: [lucide-react@^1.51.0]
example: app-stat-cards.example.tsx
---

Cards are `shadow-card`, `rounded-window`, `p-3.5`, 12px apart, two columns from a 448px
container. Inside: label in `text-caption text-fg-muted`, the figure at `text-h4` medium with a
caption suffix ("/1K"), an optional 20-dot meter (brand filled, blue-10 empty), and a footer in
`text-caption text-fg-subtle` joined with " · ".

- hover (href only): the card wraps in the 4px brand glass ring over 150ms, the label underlines
  and the arrow nudges 1px up and right. focus: the same ring.
- `riseIndex` places the block in the overview's first-visit entrance (50ms stagger).
