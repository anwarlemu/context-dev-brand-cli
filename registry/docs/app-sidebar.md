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

The navigation scrolls independently when the links exceed the available height. The list carries `fade-y`: its edges fade over 24px as it scrolls, so a row is never cut off under the header, and the bottom chevron scrolls farther down. Icons are optional on `SidebarLink` and `SidebarButton`.
