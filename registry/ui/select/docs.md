---
name: select
type: ui
version: 1.0.0
use_for: Choosing one of a short list (plan, SDK language). Native select for accessibility.
never:
  - More than 12 options; use search instead
  - className or style overrides
props: label, options ({ value, label }[]), and native select props
variants: []
example: select.example.tsx
---

Native `<select>` styled as a field. Keyboard and screen reader behavior come for free.
