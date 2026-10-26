---
name: pagination
title: Pagination
type: ui
surface: both
description: "The dashboard's pagination row: quiet Previous and Next with chevrons, page squares with the current one on the gray wash, and the page count."
use_for: "Page through a long list under its table card (monitors, batches, usage). Put PaginationSummary first (Page 2 of 5), disable Previous and Next at the ends, and keep the row 16px under the card. For tables you sort and filter too, use DataTable."
never: [Infinite scrolling for records people need to find again, A blue current page, More than seven page numbers at once]
source: "context-dashboard c0ddf7a src/components/monitors/monitors-home.tsx; src/components/batches/batches-home.tsx; src/components/usage/usage-page.tsx"
---
