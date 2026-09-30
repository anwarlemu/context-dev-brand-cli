---
name: tabs
type: ui
version: 1.0.0
use_for: Switching between 2 to 6 parallel views of one thing (benchmark metrics, FAQ topics, SDK languages).
never:
  - Tabs for sequential steps; use steps
  - More than 6 tabs
  - Animated sliding highlights; selection changes immediately
props: label, items ({ id, label, content }[]), defaultId?
variants: []
dependencies: [cx]
example: tabs.example.tsx
---

Selected tab is an outline pill in blue. Full ARIA tab pattern.
