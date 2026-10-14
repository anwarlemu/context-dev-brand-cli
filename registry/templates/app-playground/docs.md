---
name: app-playground
type: template
surface: product
version: 1.0.0
route: /(dashboard)/playground/scrape
use_for: An API's playground. Make a request, see the code for the same call, read what came back, tune parameters.
structure:
  slots:
    header: { allowed: [app-page-header], default: app-page-header, required: true, max: 1 }
    composer: { allowed: [app-composer], default: app-composer, required: true, max: 1 }
    code: { allowed: [app-code-card], default: app-code-card, required: true, max: 1 }
    result: { allowed: [app-result-card], default: app-result-card, required: true, max: 1 }
    panel: { allowed: [app-parameters-panel], default: app-parameters-panel, required: false, max: 1 }
  forbidden: [carousel]
never:
  - A made-up result before the first run; the result card invites a first call
  - A run button without its credit cost; it is the page's one filled button
  - Decorative dot patterns in the header, or a floating "Read docs" button
  - Code that scrolls sideways; lines wrap
dependencies: []
---

Order is request, code, result: the field runs the full width, the code to make the same call
sits under it, and what came back below that. The column is up to 600px, keeps 48px either side
and never goes under 400px; with the parameters panel it makes room for the 320px panel docked
28px from the right. On windows at least 560px tall the code card shrinks to fit (`fit:`); on
windows under 760px tall the gaps tighten from 32px to 20px (`short:`). The page enters with
`content-in` (4px rise and fade).
