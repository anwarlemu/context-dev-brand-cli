---
name: menubar
title: Menubar
type: ui
surface: both
description: "A bar of menus in a hairline control, its open trigger on the gray wash pill, each menu the dashboard's framed menu."
use_for: "An editor or tool with many commands grouped by kind (the playground's File, View and Run). Keep menu names to one word, put frequent commands first, and show their shortcuts. For one menu use DropdownMenu; for page navigation use NavigationMenu or the sidebar."
never: [Navigation between pages, A single menu in a bar, Animating the move from one menu to the next]
source: "context-dashboard c0ddf7a src/components/ui/menu.tsx (the menus); src/components/ui/tabs.tsx (the gray wash pill)"
---
