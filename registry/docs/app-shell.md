---
name: app-shell
title: App shell
type: block
surface: product
description: "Dashboard layout with a sidebar, top bar, credits menu, and scrollable page area."
kinds: [app-page]
use_for: The layout of a product.
never: []
source: context-dashboard c0ddf7a src/components/shell/shell-provider.tsx; src/components/shell/sidebar.tsx
---

The page scroller carries `fade-y`, so content fades at its edges instead of being cut off.
