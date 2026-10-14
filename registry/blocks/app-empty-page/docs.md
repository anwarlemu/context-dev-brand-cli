---
name: app-empty-page
type: block
surface: product
version: 1.0.0
use_for: The whole page of a list feature before anything exists (batches, monitors). A dot story, what the feature is for, one brand action, the docs, the plan limit.
never:
  - A blank table or a "No data" panel where nothing has been made yet
  - More than one brand action, or a third action
  - Stock icons or spot illustrations instead of a dot scene
  - A title that names the empty state ("No batches yet"); name what the feature does
props: scene (a DotScene name), title, body, primary { label, href }, docs? { label, href }, usage? { label, used, limit, unit?, upgrade? { label, href } }
states: [empty, at-limit]
dependencies: [app-block, app-button, app-empty-state, dot-story]
npm: [lucide-react@^1.51.0]
example: app-empty-page.example.tsx
---

Centered in the page column with `my-auto`: the dot story (288px wide, plays only on screen,
rests still with reduced motion), a `text-h4` title 32px below it, one or two sentences of
`text-body-sm text-fg-muted` capped at 480px, then the actions 20px below: brand sm with a plus,
outline sm "Read docs".

The usage line sits 24px under the actions: "Running 0 / 1 concurrent", the figures in `text-fg`
and tabular, with an outline-brand mini button (28px, 6px corners) that opens the upgrade.
at-limit: the same line with used equal to limit; the brand action stays, the upgrade explains.

Swap to app-data-table once the first item exists. Title copy says what the feature does
("Scrape pages in bulk", "Watch a page or sitemap"), the body says how, in plain words.
