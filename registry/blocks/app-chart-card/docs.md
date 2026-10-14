---
name: app-chart-card
type: block
surface: product
version: 1.0.0
use_for: The overview's usage chart. One card with a breakdown picker as its title, a range switch at the right and a stacked bar chart.
never:
  - A headline figure or pill over the chart, or a separate legend card
  - A bordered dropdown for the breakdown; the title is the menu, with a wash on hover
  - Ranges as anything but a small radio switch (7D, 30D, 3M)
  - More than one chart in the card; drill-downs go to the usage page
props: "breakdowns [{ value, label, description?, unit, series, buckets { [range]: [...] } }], ranges [{ value, label }], defaultRange?, riseIndex?, className?"
states: [default, picker-open, range-switching, breakdown-switching, empty]
dependencies: [cx, app-bar-chart, app-block, app-menu, app-tabs]
npm: [lucide-react@^1.51.0]
example: app-chart-card.example.tsx
---

A 256px card (`p-2`). Order breakdowns most useful first (Status, Key, Path, Auth); the first is
the default. Series and colors follow app-bar-chart.

- picker-open: a 288px menu drops from the title's corner (popover-in, origin-top-left), each row
  a label and a one-line description, a check on the picked one (checks hold their width).
- range-switching: the pill glides (app-tabs spring); a new bar count crossfades in over 150ms.
- breakdown-switching: the chart remounts and draws in once.
- empty: a range with no buckets shows the 0 to 4 axis and no bars.
