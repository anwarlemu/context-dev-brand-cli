---
name: native-select
title: Native Select
type: ui
surface: both
description: "The browser's own select in the dashboard's field: 40px, control corners, a light border and the up-down chevron."
use_for: "Choose one value where the platform picker serves better than a custom menu: phones, very long lists (countries, time zones), or forms that must work before script loads. Use NativeSelectOption and NativeSelectOptGroup; give it a name to submit with the form."
never: [Styling the open list (the browser draws it), A native select beside custom selects in the same form, Placeholder text as the only label]
source: "context-dashboard c0ddf7a src/components/ui/menu.tsx (SelectMenu field trigger)"
---
