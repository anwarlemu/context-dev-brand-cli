---
name: logo-wall
type: block
version: 1.0.0
use_for: Proof right under the hero. Six or twelve customer names, one outline link to their stories.
never:
  - Fewer than 6 names; use testimonials instead
  - Logos of companies that have not agreed to be shown
  - Colored logos or logo carousels
props: title, customers (string[], 6 or 12), cta? { label, href }
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, button]
example: logo-wall.example.tsx
---

Names render as quiet wordmarks in one gray so no customer brand competes with ours. Keep the
count at 6 or 12 so the grid never leaves an orphan.
