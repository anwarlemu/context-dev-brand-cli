---
name: app-menu
type: ui
surface: product
version: 1.0.0
use_for: Every dropdown in the product. SelectMenu picks one value (filters, form selects, chart periods); ActionMenu is the overflow menu at the end of a table row.
never:
  - A native select or a second dropdown style; menus and selects share one panel and one row class
  - Destructive row actions that fire on one click; give them holdMs (1200) so they fire after a hold
  - A panel that grows from its center; it grows from the corner nearest its trigger
  - Opening or closing animation on keyboard-driven lists beyond the 150ms panel entrance
props: 'SelectMenu: label, value, options ({ value, label, description? }[]), onChange, icon?, align?, appearance?, opens?, compact?, gap?. ActionMenu: label, actions ({ label, icon?, onSelect, danger?, disabled?, holdMs? }[]), icon?. MENU_* class constants'
variants: [ghost, field, chip]
states: [closed, open, hover, selected, focus, disabled, danger, holding]
dependencies: [cx]
npm: [lucide-react@^1.51.0]
example: app-menu.example.tsx
---

Variants are SelectMenu's `appearance`:
- `ghost` (default): 32px bordered toolbar button, muted label; open or hovered, the border steps to line-strong.
- `field`: 40px (28px `compact`) full-width field beside inputs; open, the border turns accent.
- `chip`: 28px gray pill (`bg-wash/4`, open `/6`) for a card footer, such as a period picker.

The panel is `rounded-shell`, 6px padding, `shadow-floating`, 6px off the trigger (`gap="lg"`: 16px).
It enters with `popover-in`: opacity plus scale 0.97 to 1, 150ms ease-emphasized, origin at the
corner nearest the trigger (`origin-top-left`, `origin-bottom-right`...). Reduced motion keeps the
fade only. No exit animation. It closes on an outside mousedown, on Escape and on selection.

States: rows hover with `bg-wash/4` over 150ms; the selected option is `text-fg` with an accent
check, the rest `text-fg-muted`. Disabled rows are 40% opacity. `danger` rows are `text-danger`
with a `bg-danger/6` hover. A `holdMs` row shows "Hold 1.2s"; held, a fill sweeps across linearly
for the full duration and the label reads "Keep holding…"; released early, it snaps back in 150ms.
Lists over 320px scroll with `scrollbar-thin`. Rows stack 2px apart.
