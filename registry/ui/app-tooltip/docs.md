---
name: app-tooltip
type: ui
surface: product
version: 1.0.0
use_for: The label for an icon-only control or a truncated value. Appears beside or above its trigger on hover or keyboard focus.
never:
  - Tooltips that hold the only copy of something a user must read; put it on the page
  - Interactive content inside a tooltip (links, buttons); use a menu or dialog
  - Showing on every hover at once; the first waits 1000ms so passing over a control doesn't flash it
  - Animating warm tooltips; after the first, the next ones in a sweep appear instantly
props: label, side? (right | top), wrap?, enabled?, className?, children (the trigger)
variants: [right, top]
states: [hidden, delayed, open, warm, flipped]
dependencies: [cx]
example: app-tooltip.example.tsx
---

- `right` (default): 8px right of the trigger, centered on it. Used in the sidebar.
- `top`: 6px above, centered. Used for icon buttons in rows and fields.

States:
- hidden to delayed: pointer enter starts a 1000ms timer; leaving cancels it.
- open: `text-micro` (11px) on `bg-surface`, `rounded-control`, `shadow-tooltip`. The first label grows
  from its trigger with `popover-in` (opacity plus scale 0.97 to 1, 150ms ease-emphasized, origin on
  the trigger side); reduced motion keeps only the fade.
- warm: within 300ms of another tooltip closing, the next one shows at once with no animation.
- Keyboard focus (focus-visible) shows it immediately. Scroll, click, blur and pointer leave close it.
- flipped: a `top` label with no room above sits 6px below instead. Labels are nudged back inside the
  window with an 8px margin. Portaled to the body, so clipped containers can't cut it off.
