---
name: button
type: ui
version: 1.0.0
use_for: Every action. Pill, 1px border, 16px label, sentence case.
never:
  - More than one primary on a page
  - Icons as the only label
  - Labels over 5 words or in Title Case
  - Filled blue buttons; blue actions are outlined
props: variant?, size? (default | small), href?, type?, onClick?, disabled?, children
variants: [primary, secondary, on-brand, quiet]
copy_rules: voice.md#mechanics
dependencies: [cx]
example: button.example.tsx
---

`primary` is the filled black pill: one per page, for the main action ("Start for free").
`secondary` (default) is the blue outline pill used for every other action. `on-brand` is the white
outline pill on a blue surface. `quiet` is a neutral outline for low-stakes actions ("Book demo").
Pass `href` for links; it renders an anchor with the same styles.
