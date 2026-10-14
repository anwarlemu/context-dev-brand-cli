---
name: app-list
type: template
surface: product
version: 1.0.0
route: /(dashboard)/api-keys
use_for: A list of records (API keys, batches, monitors, members). Header with the one brand action, then the table, or the first-run empty state.
structure:
  slots:
    header: { allowed: [app-page-header], default: app-page-header, required: false, max: 1 }
    banner: { allowed: [app-banner], default: app-banner, required: false, max: 1 }
    content: { allowed: [app-data-table, app-empty-page], default: app-data-table, required: true, max: 1 }
  forbidden: [carousel]
never:
  - A blank table on first run; show app-empty-page with the one next action
  - Endless scroll; tables paginate 10 rows a page
  - More than one brand button on the page; the create action lives in the header
  - Left-aligned title with actions on the right; product headers are centered
dependencies: []
---

Populated: the centered header (title, one sentence, the brand create action under it), an
optional limit banner, then the data table (toolbar, table card, pagination). Sections sit 24px
apart in the 880px column.

First run, before any records exist: drop the header and use the empty page, which carries its own
title: `scaffold app-list --slot header=none --slot banner=none --slot content=app-empty-page`.
The empty page centers vertically in the column.
