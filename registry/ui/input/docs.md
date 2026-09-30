---
name: input
type: ui
version: 1.0.0
use_for: Single-line text fields. Always labelled.
never:
  - Placeholder as the only label
  - className or style overrides
props: label, hideLabel?, and native input props (name, type, placeholder, value, onChange...)
variants: []
example: input.example.tsx
---

`hideLabel` keeps the label for screen readers when the design shows none (the hero demo input).
