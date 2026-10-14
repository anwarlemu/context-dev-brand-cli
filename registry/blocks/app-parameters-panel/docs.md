---
name: app-parameters-panel
type: block
surface: product
version: 1.0.0
use_for: The playground's docked parameters panel. Output-format toggles, then groups of parameter rows in soft gray boxes, with a changed count and Reset.
never:
  - An open or close animation; it appears and goes at once and never moves the page column
  - Uneven row padding; every control gets 12px on every side, switches included
  - Bordered fields inside the gray boxes; fields are filled gray (bg-wash/5)
  - A visible scrollbar; edges fade and a "More" pill scrolls the rest into view
props: formats? { options, selected }, groups [{ title, params [{ name, label, description?, control (switch | select | number | text), value, options?, placeholder?, mono? }] }], onChange?(values), onClose?, className?
states: [default, changed, scrolled, more-below, closed]
dependencies: [app-block, app-composer, app-icon-button, app-switch, cx]
npm: [lucide-react@^1.51.0]
example: app-parameters-panel.example.tsx
---

320px wide on the card shadow. The template docks it 28px from the window's right edge, level
with the page title, and gives it the height down to 28px above the bottom.

- Header: "Parameters" at `text-body`, a brand count badge when something changed, "Reset" (only
  when changed) and a close button.
- Formats: a 3-column grid of 32px toggles, selected `border-brand bg-blue-10/60 text-accent`.
  The last selected format can't be turned off.
- Groups: a `text-caption font-medium text-fg-muted` title, then one `bg-neutral-5` box ruled
  between rows. A row is `p-3`: label left, control right (switch, 32px select, 112px number),
  the description under it, and a text field below for text parameters.
- changed: count badge and Reset, which restores every default.
- scrolled / more-below: 20px and 32px fades to the surface (200ms opacity) and a "More" pill that
  scrolls 80% of a view; it fades, it does not move.
- closed: renders nothing; the composer's Parameters toggle brings it back.
