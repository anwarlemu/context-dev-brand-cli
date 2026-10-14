---
name: app-detail-card
type: block
surface: product
version: 1.0.0
use_for: The body of a detail page (a batch, a run, a request). Status head, gray detail lists in titled sections, and a paged results list.
never:
  - Key and value pairs laid out as cards or a grid of boxes; they are rows in one gray list
  - Status as a filled badge; it is the boxed mono label
  - Destructive menu items without a hold
  - Success badges on rows that worked; only failures flag themselves
props: status { tone, label, running? }, meta, id, actions? [{ id, label, icon? (download | stop | trash), danger?, hold? }], sections [{ title, rows [{ label, value, help?, stacked?, mono?, tone? (muted | subtle | success | accent) }] }], results? { title, items [{ label, ok, detail }], emptyText, pageSize? }, onAction?(actionId)
states: [running, finished, results-empty, results-paged]
dependencies: [app-block, app-copy-button, app-menu, app-status, cx]
npm: [lucide-react@^1.51.0]
example: app-detail-card.example.tsx
---

One card (`shadow-card`, 10px corners). The head is 20px in: the boxed mono status label, a
spinner while running, the meta line ("Scrape · Markdown"), the row menu at the right, then the
mono id with a copy button.

Sections stack 24px apart. Each has a `text-caption text-fg-subtle` title and a gray list
(`bg-neutral-5`, hairlines between rows, rows 14px by 12px). A row is label left and value right
(tabular), or `stacked` for long values; `help` adds a caption line under it.

- running: tone running, `running: true` shows the spinner. finished: success, neutral or danger.
- results-empty: one centered line, "Pages show up here as they finish."
- results-paged: past `pageSize` (10), "1–10 of 120" with two 24px chevron buttons.
Put the breadcrumb ("Batches > id") in the page header above the card, not inside it.
