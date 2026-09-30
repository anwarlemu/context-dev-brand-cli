---
name: tooltip
type: ui
version: 1.0.0
use_for: A short label for an icon-only control or an abbreviation. Hover and focus.
never:
  - Essential information only in a tooltip
  - Tooltips longer than 8 words
props: label, children (the focusable trigger)
variants: []
example: tooltip.example.tsx
---

CSS only. The trigger must be focusable so keyboard users see the label.
