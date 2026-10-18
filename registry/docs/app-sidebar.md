---
name: app-sidebar
title: App sidebar
type: product
surface: product
description: "Dashboard navigation with workspace controls, search, grouped links, and footer actions. Opens as a drawer on phones."
kinds: [app-sidebar, app-nav-item, app-nav-label]
use_for: Every product page.
never: [A blue active item, A bordered or filled sidebar, Animating the switch between link lists]
source: context-dashboard c0ddf7a src/components/shell/sidebar.tsx
---

The navigation scrolls independently when the links exceed the available height. Edge fades indicate hidden links, and the bottom chevron scrolls farther down. Icons are optional on `SidebarLink` and `SidebarButton`.
