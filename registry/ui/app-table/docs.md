---
name: app-table
type: ui
surface: product
version: 1.0.0
use_for: Every list of records in the product (API keys, batches, monitors, team members, invites). A white card with a gray header row, hairline row dividers and a menu at the end of each row.
never:
  - Cards or tiles for data that belongs in rows
  - Zebra stripes, vertical rules or a border around the table; the card's hairline is the edge
  - A header row and a row hover in the same gray; the header is darker
  - Clipping the card (overflow-hidden); row menus must open past its edge
  - Infinite scroll; long lists paginate
props: AppTable, AppTableHead, AppTableHeader (actions?), AppTableBody, AppTableRow (onClick?, selected?), AppTableCell (actions?), AppTableEmpty (colSpan), AppTableLoading (rows, columns), AppTablePagination (page, pageSize, total, onPageChange)
states: [default, row-hover, selected, empty, loading, paginated]
dependencies: [cx, app-skeleton, app-menu, app-status]
npm: [lucide-react@^1.51.0]
example: app-table.example.tsx
---

Anatomy: `rounded-window bg-surface shadow-card`, `text-body-sm`. Header: `text-caption text-fg-subtle`,
regular weight, cells `px-4 py-2.5` on `bg-neutral-10/40`, corners rounded on the cells themselves.
Body cells `px-4 py-3`, rows divided by `line-subtle` hairlines. A two-line first cell (name, then
`text-caption text-fg-subtle` meta such as "Created Sep 5, 2026") leads each row. The last column is
the 48px `actions` cell with an `ActionMenu` from app-menu; destructive actions in it use `holdMs`.
Hide secondary columns on small screens (`hidden sm:table-cell`), keeping name, key and actions.

States:
- `row-hover`: only rows with `onClick` (they open the detail page): pointer and `bg-neutral-5/60`, 150ms.
- `selected`: `bg-blue-10/60`.
- `empty`: one centered `text-fg-subtle` sentence, 48px above and below ("No keys match these filters.").
  A list with no records at all is not an empty table; show app-empty-state instead.
- `loading`: AppTableLoading draws skeleton rows at the real row height.
- `paginated`: 12px under the card, "1–10 of 248" on the left (`text-fg-subtle`, tabular), Previous
  and Next as ghost buttons on the right, disabled (40%) at the ends.
