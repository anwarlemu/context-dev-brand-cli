---
name: app-switch
type: ui
surface: product
version: 1.0.0
use_for: An on or off setting that applies at once (Main content only, Include frames, a Parameters panel toggle).
never:
  - A switch that needs a Save button to take effect; use a checkbox in a form
  - A label inside the track ("On", "Off"); the row's label says what it controls
  - A dark thumb shadow; it turns into a gray halo against the blue
  - Bounce or overshoot on the thumb
props: checked, onCheckedChange(checked), label (aria), disabled?
states: [off, on, focus, disabled]
dependencies: [cx]
example: app-switch.example.tsx
---

36 by 20px track (`rounded-pill`), 14px white thumb held 3px inside the track on every side.

States:
- off: `bg-neutral-10` with an inset hairline so the pale track has an edge.
- on: `bg-brand`, no edge. The track color changes over 200ms ease-out; the thumb travels 16px on
  `transform` over 200ms ease-emphasized. Reduced motion drops the travel animation, keeps the color.
- focus: the brand glass ring. disabled: 50% opacity, no pointer events.

The switch sits at the right end of its row with the setting's name and a one-line description on
the left (app-parameters-panel). Interruptible: it is a transition, so a fast double toggle retargets.
