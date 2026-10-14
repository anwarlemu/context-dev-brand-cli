---
name: app-tabs
type: ui
surface: product
version: 1.1.0
use_for: Switching views on a page (Personal, Organization, Billing) or picking one value in a form or chart (7D, 30D, 3M). AppSegmentedControl is the radio form.
never:
  - Underlines, borders or boxed tab strips; one soft gray pill marks the selection
  - Hover fills on unselected tabs; only the text darkens, so nothing fades over the gliding pill
  - Tabs for fewer than two or more than six options; use a select menu past six
  - Tabs to filter a table by status; that is a select menu in the toolbar
props: value, options [{ value, label, count?, href? }], onChange? (omit to self-manage; href options are links, server-safe), label (aria), size? (sm | md), kind? (tabs | radio), className?
variants: [tabs, radio]
states: [default, hover, selected, focus, gliding]
dependencies: [cx]
example: app-tabs.example.tsx
---

- `tabs` (default): `role="tablist"`, switches the view below. `radio`: `role="radiogroup"`, a value
  in a form or a chart's range. `AppSegmentedControl` is `radio` with nothing else to set.
- Sizes: `md` 36px tall, 16px sides, `text-body-sm`, `rounded-control`; `sm` 28px, 12px sides,
  `text-caption`, `rounded-control-sm`, for chart ranges and card headers.
- `count` renders after the label in tabular figures.

States:
- default: `text-fg-subtle`. hover: `text-fg`, a color transition only.
- selected: `text-fg` over the pill, `bg-wash/6`. Before the pill is measured the selected tab draws
  the surface itself, so the server render matches the first paint.
- gliding: the pill moves on a spring (response 0.34s, damping 0.82: quick, the faintest overshoot),
  retargets from wherever it is when tabs change fast, and jumps with reduced motion.
- focus: the brand glass ring.
