---
name: app-bar-chart
type: ui
surface: product
version: 1.0.0
use_for: Usage over time. A stacked bar a bucket, each series a band in its color, a value axis, three dates and a legend that picks a series out.
never:
  - Bar borders or strokes; bands sit flush, only the bar's top corners round (3px)
  - More than three date labels (first, middle, last) or a headline pill over the chart
  - Red for anything but errors; named series run series-1 to series-4 in order
  - Easing on the hover card; it follows the pointer at once
props: "buckets [{ label, values { key: number } }], series [{ key, label, color }], unit, label (aria), focusKey?, onFocusChange?, legendAside?, className?. niceMax, CHART_COLORS"
states: [drawing-in, idle, hover, focused, morphing, swapping, empty]
dependencies: [cx]
example: app-bar-chart.example.tsx
---

Colors are token names: brand, series-1 to series-4, ok, client-error, server-error, alert,
alert-strong, other. Status charts stack ok at the bottom, errors above it.

- drawing-in: on first mount bars grow from the axis (`chart-bar-in`, 480ms ease-emphasized),
  spread over 300ms left to right. Once only.
- hover: a faint wash column (4%) behind the bucket, and one hover card (counts and shares) off
  the pointer. Leaving the plot hides it.
- focused: clicking a legend name fades other bands to 18% and their names to 40% (200ms);
  clicking it again shows all. Uncontrolled unless `onFocusChange` is passed.
- morphing: new data with the same number of bars glides to the new heights over 250ms (ease-out
  quint, interruptible). swapping: a new bar count fades in over 150ms (`chart-swap`).
- empty: the axis still reads 0 to 4; no bars.

Reduced motion: no draw-in, no morph. Size the parent: the chart fills it (min 112px tall).
Axis text `text-micro` in fg-subtle with compact numbers ("1.2K"); gridlines in line-subtle.
