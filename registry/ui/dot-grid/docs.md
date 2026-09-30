---
name: dot-grid
type: ui
version: 1.1.0
use_for: Static dot drawings and simple patterns. For the animated pictures from context.dev, use dot-story.
never:
  - Dots in any color but the surface's accent
  - Solid dots everywhere; solid is the rare, meaningful part
  - The pattern behind body text
  - Icons or stock illustrations instead of dots
  - A hand-drawn picture where a dot-story scene exists
props: pattern? (rows of 'o' hollow, 'x' solid, ' ' empty), cols?, rows?, solid? ([row, col][]), tone? (on-white | on-brand | on-black), size? (sm | md | lg), label?
variants: []
dependencies: [cx]
example: dot-grid.example.tsx
---

Draw with `pattern`: one string per row. `o` is a hollow dot, `x` a solid dot, a space leaves a
gap (missing information). Or give `cols`, `rows` and the `solid` cells. Pass `label` when the
drawing carries meaning (a chart); otherwise it is decorative and hidden from screen readers.
Pitch is always twice the dot size, as in the brand guidelines.
