---
name: code-showcase
type: block
version: 1.0.0
use_for: Show the real SDK call for each job, one tab per job, description left and code right.
never:
  - Code that does not run against the current SDK
  - Syntax color themes; code is plain mono on the dark window
  - More than 6 tabs or samples over 20 lines
props: title, highlight?, sub?, items ({ id, label, description, code }[], max 6)
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, tabs, code-window]
example: code-showcase.example.tsx
---

Each tab is one job with the shortest working request. Copy the code from the SDK docs and run it
before shipping. On product pages keep a single item for that API.
