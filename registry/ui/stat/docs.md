---
name: stat
type: ui
version: 1.1.0
use_for: One large, provable figure in Doto with a one-line label ("94%" of pages returned as clean content).
never:
  - More than one Stat in view at once
  - Doto for anything but the figure
  - A figure without a source; link the benchmark next to it
props: value, label, tone? (default | on-brand)
variants: []
dependencies: [cx]
example: stat.example.tsx
---

Doto is the figure face: numbers only. Use Stat for a static figure, CreditsDotNumber when the
figure should draw itself in dots, and `font-data` for values inside charts. The label is Rethink Sans.
The check fails a large figure that is not in Doto, and Doto on words.
