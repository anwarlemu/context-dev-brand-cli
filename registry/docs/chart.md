---
name: chart
title: Chart
type: ui
surface: both
description: "Line, area, bar and donut charts in SVG, drawn as the dashboard's usage charts, with a shared hover card and a legend."
use_for: "Use to show a measure over time or by category: calls per day, credits by API, response codes. Wrap the chart in ChartContainer with a config that names (and optionally colors) each series, add ChartTooltip with ChartTooltipContent and ChartLegend with ChartLegendContent. For the dashboard's own usage cards with their picker and morphing bars, use BarChart and LineChart from product."
never: [More than five series, 3D or gradient-filled bars, Charts that redraw their entrance on every change]
source: "context-dashboard c0ddf7a src/components/overview/line-chart.tsx; src/components/overview/bar-chart.tsx; src/components/overview/chart-tooltip.tsx"
---
