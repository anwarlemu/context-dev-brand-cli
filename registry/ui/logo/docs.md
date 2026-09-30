---
name: logo
type: ui
version: 1.0.0
use_for: The Context.dev logo. Logomark, horizontal or vertical combination mark, in the approved colorways.
never:
  - Redrawing, stretching, rotating or recoloring the logo
  - Shadows or outlines on it
  - Below 16px high (32px for vertical)
  - The wordmark before the logomark
props: variant? (mark | horizontal | vertical), tone? (blue-black | blue-white | white | black), height? (16 | 24 | 32 | 36 | 64 | 96 | 128 | 160), title?
variants: [mark, horizontal, vertical]
dependencies: [cx]
example: logo.example.tsx
---

Paths are the official SVGs from the brand assets. `blue-black` on white, `white` on blue (the
primary background), `blue-white` on black. Keep clear space of one third of the mark's width.
