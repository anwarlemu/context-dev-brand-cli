---
name: data-table
title: Data Table
type: ui
surface: both
description: "A sortable, filterable, selectable table on the dashboard's table card, with a search toolbar, a Columns menu and the pagination row."
use_for: "Lists people search, sort, select and page through: monitors, API keys, batch files, team members. Give each column an accessor to sort and filter by, a cell to render it, and mark the ones that sort. Turn on selectable for bulk actions and put those actions in toolbar. For a short static list, use Table."
never: [Pagination for fewer than about 20 rows, Animating rows as they sort or page, Hiding the only column that identifies a row]
source: "context-dashboard c0ddf7a src/components/monitors/monitors-home.tsx (toolbar, table card, pagination row)"
---
