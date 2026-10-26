---
name: combobox
title: Combobox
type: ui
surface: both
description: "A searchable select: the select field opens a panel with a search row and the select's rows; several values show as chips."
use_for: "Choose from a list too long to scan (organizations, domains, API keys, countries) or where typing is faster. Use ComboboxTrigger with ComboboxValue for one value, ComboboxChips with ComboboxChip and ComboboxChipsInput for several; give a name to submit the values with the form."
never: [A combobox for fewer than seven options (use Select), Losing the typed search on a pick in multiple mode, Animating the highlight between rows]
source: "context-dashboard c0ddf7a src/components/ui/menu.tsx (SelectMenu) and the shell's command palette"
---
