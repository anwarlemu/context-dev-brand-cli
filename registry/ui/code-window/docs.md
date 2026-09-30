---
name: code-window
type: ui
version: 1.0.0
use_for: SDK samples and the agent setup prompt. Window with three dots (first solid), title or tabs, copy.
never:
  - Syntax colors outside the tokens
  - Screenshots of code instead of text
  - Code that does not run against the real API
props: title, code, tabs?, activeTab?, copyable?, tone? (dark | light)
variants: []
dependencies: [cx]
example: code-window.example.tsx
---

`dark` for SDK code, `light` for the one-line agent setup prompt. Code is plain IBM Plex Mono,
no highlighting, so it stays on-token. Keep samples under 20 lines.
