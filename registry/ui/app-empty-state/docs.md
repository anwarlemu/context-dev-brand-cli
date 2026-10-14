---
name: app-empty-state
type: ui
surface: product
version: 1.0.0
use_for: A section with nothing made yet (no batches, no monitors), or a card before its first run. A fine-dot picture, what the section does, and the one next action.
never:
  - A blank panel, or an empty table with headers and no rows
  - Stock icons or illustrations; the picture is drawn from the dot grid (dot-story)
  - More than one brand action; the second action, if any, is outline ("Read docs")
  - Made-up sample results in place of the empty state
  - Copy that apologizes or says "No data"; say what the section does and how to start
props: variant? (page | inline), media?, title, body, actions?, footnote?, className?
variants: [page, inline]
states: [empty]
dependencies: [cx, dot-story, app-button]
example: app-empty-state.example.tsx
---

- `page`: centered in the page column and vertically, 64px above and below. Picture 288px wide,
  title `text-h4` 32px under it, body `text-body-sm text-fg-muted` balanced at most 480px wide,
  actions 20px under (small buttons, 8px apart), footnote 24px under (a usage line such as
  "Running 0 / 1 concurrent" with an `outline-brand` "Increase limit").
- `inline`: inside a card, 12px between parts. Title `text-h5`, body at most 384px, footnote as
  `text-caption text-fg-subtle` (for example "Try context.dev, stripe.com/pricing" as accent links
  that run the example), then the action.

Pick the scene that matches the section (`batch`, `watch`, `scrape`, `search`...). It plays only on
screen and rests still with reduced motion. Title: what the section does, in a few words ("Scrape
pages in bulk"). Body: one sentence on what the first one gets you.
