---
name: dot-panel
type: ui
version: 1.0.0
use_for: The ring-filled panel the site sets its one interactive or code element on (the hero demo, the code showcase).
never:
  - More than one dot panel per section
  - Text set directly on the rings; put a card or window on it
  - Any tone but white and blue
props: tone? (white | blue), padding? (default | none), children
variants: []
dependencies: [ring-backdrop, cx]
example: dot-panel.example.tsx
---

A pale blue ring around a panel filled with hollow rings, the open web, that clear around the content
placed on it. `blue` is the hero's one block of color (white rings on brand blue, around the demo
input). `white` sits behind code windows (blue rings on white).
