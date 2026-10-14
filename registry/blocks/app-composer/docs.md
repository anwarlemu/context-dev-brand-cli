---
name: app-composer
type: block
surface: product
version: 1.0.0
use_for: The playground's request bar. One field, the Parameters toggle, and the brand run button that carries its credit cost.
never:
  - A run button without its cost; the price is always in view
  - A second filled button on the page; the run button is the one
  - A round search pill; the bar has 8px corners like every control
  - An outline focus ring; focus is the brand border and the 4px brand ring
props: placeholder, icon? (globe | search), actionLabel, cost, perCall? (true), defaultValue?, changedCount?, parametersOpen? (true), running?, onRun?(value), onToggleParameters?(open). Also exports AppRunButton and AppCostBadge
states: [default, hover, focus, parameters-open, changed, running]
dependencies: [app-block, app-button, app-tooltip, cx]
npm: [lucide-react@^1.51.0]
example: app-composer.example.tsx
---

The bar is 48px tall on the card shadow, with a globe (URL inputs) or search icon, the input at
`text-body-sm`, and the two buttons 8px apart and 8px from the bar's edge, so they read as one
inset group.

- hover: the card wraps in the 4px brand glass ring (150ms ease-out).
- focus: brand border plus the same ring, no outline.
- parameters-open: the toggle sits in `bg-wash/5`. changed: a 16px brand count badge on it.
  Tooltip "Parameters · ⇧P"; the label hides on phones.
- running: a spinner before the label and the button disabled until the call returns.
Run button: brand sm, the action verb ("Scrape", "Search", "Crawl") then the cost chip
("1 credit per call", "up to 50 credits"), white at 15% with a hairline ring. An empty submit runs
the placeholder example.
