---
name: app-dialog
type: ui
surface: product
version: 1.0.0
use_for: Product dialogs (create a key, confirm a delete, pick a plan). A white box in a glass frame over a light scrim, near the top of the window.
never:
  - Dialogs on marketing pages; they are product-only
  - More than one brand button in the footer; the footer is Cancel (ghost or outline) then the one action (brand)
  - A dialog that grows from its trigger or slides in; it is centered and rises 4px
  - Closing on Enter or on any click inside the box; it closes on Escape, the X, and a press on the scrim
  - Nesting a dialog in a dialog
props: title, description?, onClose, children, footer?, footerDivider? (default true), size? (md | lg | xl | 2xl)
variants: [md, lg, xl, 2xl]
states: [open, closing]
dependencies: [cx, app-button]
npm: [lucide-react@^1.51.0]
example: app-dialog.example.tsx
---

Render it only while open (`{isOpen && <AppDialog ... />}`); it portals to the body.

Variants are `size`: `md` 512px (forms, confirms), `lg` 768px (pickers in columns), `xl` 1024px
(four plan cards), `2xl` 1152px (five).

Anatomy: `glass-frame` (6px frame, `rounded-shell`, `shadow-floating`) around a `rounded-shell` white
box. Title `text-h5`, description `text-body-sm text-fg-muted` 6px under it, close X at the top right
pulled out by its own padding. Body padding 20px. Footer: right-aligned actions 8px apart, under a
`line-subtle` hairline (`footerDivider={false}` for a quiet footer line with no divider).

Motion: the scrim fades in (150ms); the box enters with `content-in`, opacity plus 4px of rise,
200ms ease-emphasized, centered (no transform-origin). Reduced motion keeps the fade only. No exit
animation: it unmounts on close. The overlay scrolls, so a tall dialog reads to its end on a phone.
