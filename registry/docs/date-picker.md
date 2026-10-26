---
name: date-picker
title: Date Picker
type: ui
surface: both
description: "A date field in the select's look that opens the calendar in a floating panel, with optional presets."
use_for: "Ask for a date or a range in a form or a toolbar (an API key's expiry, a usage report's window). Use DatePicker for one date and DateRangePicker for a range; presets add shortcuts (Last 7 days). Give it a name to submit ISO dates with the form."
never: [Typing dates into a plain input without a calendar, Closing a range picker after the first day, Presets that are not dates]
source: "context-dashboard c0ddf7a src/components/ui/menu.tsx (SelectMenu field) with dates as in src/lib/format-date.ts"
---
