---
name: footer-watermark
type: ui
version: 1.0.0
use_for: "The giant dotted context.dev wordmark at the bottom of the footer, with its cursor."
never:
  - Anywhere but the footer
  - Another wordmark or text in its place
props: "className?"
variants: []
dependencies: [dot-engine, cx]
example: footer-watermark.example.tsx
---

Lights up under the pointer. Sits on the black footer surface.
