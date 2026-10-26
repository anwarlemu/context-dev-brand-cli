---
name: item
title: Item
type: ui
surface: both
description: "A row of content: a glyph or picture, a title over a muted line, actions at the end."
use_for: "Use for rows in a list or a settings group: an API key with its last use, a monitor with its schedule, a team member with their role. ItemGroup stacks them; ItemSeparator rules them. As a link or button (asChild) an item washes on hover; aria-current marks the selected one. `outline` puts a row on its own card, `muted` on the subtle gray; size sm makes sidebar-height rows."
never: [Bold titles, Two lines of actions in one row, A row that moves on hover]
source: "Extrapolated from context-dashboard c0ddf7a src/components/settings/settings-page.tsx (settings rows) and src/components/shell/sidebar.tsx (links)"
---
