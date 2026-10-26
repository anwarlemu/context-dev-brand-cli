---
name: calendar
title: Calendar
type: ui
surface: both
description: "A month grid of 32px day keys: today in blue, a chosen day as the blue key, a range on the blue tint."
use_for: "Pick a day, several days or a range in place (a report window, the days a monitor runs). For a field that opens a calendar use DatePicker. Use mode=\"single\" (the default), \"multiple\" or \"range\"; disabled takes dates, ranges or a function. Arrow keys, Page Up and Page Down work."
never: [Animating month changes, Weekday names longer than two letters, A calendar without a way to reach today]
source: "Extrapolated from context-dashboard c0ddf7a src/components/ui/button.tsx (ghost icon buttons, the wash and the brand blue) with dates as in src/lib/format-date.ts"
---
