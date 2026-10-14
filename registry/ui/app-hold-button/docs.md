---
name: app-hold-button
type: ui
surface: product
version: 1.0.0
use_for: A destructive action (delete a key, remove a member, delete an account) that fires only after being held for 1.2s.
never:
  - A destructive action that fires on a single click
  - A confirm dialog in front of a hold button; the hold is the confirmation
  - Filled red at rest; it is a red outline until held
  - Easing on the fill; it is linear because it shows progress
props: label, onConfirm, holdMs? (default 1200)
states: [default, holding, released, confirmed, focus]
dependencies: [cx]
example: app-hold-button.example.tsx
---

A 32px red outline button (`border-danger text-danger`, `rounded-control`). Pointer down, Enter or
Space starts the hold; pointer up, pointer leave, key up and blur cancel it.

States:
- default: the label in red on the surface.
- holding: a red fill grows from the left with `scale-x` over the full hold (1200ms, linear), the label
  turns white and reads "Keep holding…".
- released early: the fill snaps back in 150ms ease-out. Slow to commit, fast to undo: the timing is
  deliberately asymmetric.
- confirmed: after the full hold, `onConfirm` runs and the button resets.
- focus: the brand glass ring.

Inside a row overflow menu, the same hold is the `holdMs` option on app-menu's ActionMenu.
