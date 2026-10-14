---
name: app-field
type: ui
surface: product
version: 1.0.0
use_for: A labeled form control in the product. AppField (label, help, error) around AppInput or AppTextarea.
never:
  - Placeholder text as the only label; every control has a visible label above it
  - Gray field fills; fields are bg-surface with a 1px line border
  - Focus rings or glows on fields; focus turns the border brand blue
  - Help and error at once; the error replaces the help line
props: AppField label, help?, error?, labelAction?, children(id, invalid). AppInput and AppTextarea take native props plus invalid?
states: [default, hover, focus, error, disabled]
dependencies: [cx]
example: app-field.example.tsx
---

Anatomy: label (`text-body-sm`), 8px, control, 8px, one line of help (`text-caption text-fg-subtle`).
`labelAction` sits beside the label, for a quiet link such as "Change" in `text-accent`.
AppInput is 40px tall with 14px sides; AppTextarea has 10px top and bottom, line height 1.45 by text.
`APP_INPUT_CLASS` and `APP_TEXTAREA_CLASS` style controls built elsewhere (a select field).

States:
- default: `border-line`, placeholder in `text-fg-subtle`.
- hover: `border-line-strong`.
- focus: `border-brand`. The border color changes over 150ms ease-out; nothing else moves.
- error: pass `error` to AppField and `invalid` to the control: `border-danger`, the message in
  `text-danger` in place of the help.
- disabled: 50% opacity, no pointer events.
