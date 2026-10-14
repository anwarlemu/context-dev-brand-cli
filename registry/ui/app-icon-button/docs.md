---
name: app-icon-button
type: ui
surface: product
version: 1.0.0
use_for: An icon-only action (close, row menu, search, reveal, copy). A square ghost button that always carries a tooltip.
never:
  - An icon button without a label; `label` is the aria-label and the tooltip
  - Borders or fills at rest; it is ghost until hovered
  - Using it for the main action of a page; that is an app-button with words
  - Icons larger than size-4 or heavier than strokeWidth 1.75
props: label, size? (sm | md), side? (top | right), open?, disabled?, onClick?, className?, children (one lucide icon)
variants: [sm, md]
states: [default, hover, open, focus, disabled]
dependencies: [cx, app-tooltip]
example: app-icon-button.example.tsx
---

- `md` (default): 32px square, for toolbars, dialog close and row menus. Icon `size-4`, strokeWidth 1.5.
- `sm`: 28px square, inside fields and code cards (reveal, copy). Icon `size-3.5`, strokeWidth 1.5.

States:
- default: `text-fg-subtle`, no fill.
- hover: `bg-wash/4` and `text-fg`, a 150ms color transition. No movement.
- open: pass `open` while its menu or panel is open; it keeps the hover look, sets `aria-expanded`
  and holds its tooltip back.
- focus: the brand glass ring (`focus-visible:shadow-ring-hover`).
- disabled: 40% opacity, no pointer events.

Pull a close X up and out by its own padding (`-mt-1.5 -mr-2`) so its center sits on the title's line.
