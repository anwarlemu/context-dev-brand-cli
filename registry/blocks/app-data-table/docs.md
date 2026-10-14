---
name: app-data-table
type: block
surface: product
version: 1.0.0
use_for: A list page's toolbar and table card (API keys, batches, monitors, team). Search, tabs or one filter, rows as data, row menus, pagination.
never:
  - A table without its card, or a border around the card; the card shadow carries the edge
  - Endless scroll; 10 rows a page with "1–10 of 248" and Previous / Next
  - A destructive row action without a hold (set hold, a 1500ms hold)
  - Colored figures or links in cells; status is a dot and a word
  - Tabs and a filter together
props: columns [{ key, label, align?, hideBelow? (sm | md | lg | xl) }], rows [{ id, href?, group?, cells }], searchPlaceholder?, tabs? [{ value, label }], filter? { label, options }, actions? [{ id, label, icon?, danger?, hold?, href? }], emptyText?, pageSize? (10), selectedId?, loading?, onAction?(actionId, rowId)
states: [populated, filtered-empty, loading, with-selection, paginated]
dependencies: [app-block, app-table, app-tabs, app-menu, app-status, cx]
npm: [lucide-react@^1.51.0]
example: app-data-table.example.tsx
---

Cells are data: a string or number (numbers get `en-US` grouping and tabular figures), `{ title, sub }`
for a name over a caption, `{ mono }` for ids and keys, `{ status, label }` for a dot and a word
(tones from app-status). Icons are names: eye, key, pause, pencil, play, resend, stop, trash,
remove, revoke. An action `href` may contain `:id`, replaced by the row id.

- populated: gray header row (`bg-neutral-10/40`), hairlines between rows; a row with `href`
  navigates and answers hover with `bg-neutral-5/60` (150ms ease-out).
- filtered-empty: one centered line in the table (`py-12`), "No results match “q”." or `emptyText`.
- loading: three skeleton rows at the real row height.
- with-selection: the row whose id is `selectedId` sits in `bg-blue-10/60`.
- paginated: shown only when rows exceed `pageSize`. Search and tabs reset to page 1.
Tabs show a count for each group. Toolbar: search 32px tall, 256px wide, brand border on focus.
