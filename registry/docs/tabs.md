---
name: tabs
title: Tabs
type: ui
surface: both
description: "View tabs with product and site variants and an animated selection indicator."
kinds: [tabs, app-tabs]
use_for: "Two to six sibling views. `size=\"sm\"` in dense cards, `pill` on the site, `glide={false}` when your triggers draw their own selected surface."
never: [Tabs for actions, Underlined tabs]
source: context-dashboard c0ddf7a src/components/ui/tabs.tsx; website src/components/sections/faq.tsx; src/components/ui/tabs.tsx (site pill tabs, the brand variant)
reference_commit: 1bd8062d
---
