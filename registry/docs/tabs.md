---
name: tabs
title: Tabs
type: ui
surface: both
description: "Switch between views. The product's plain labels with a soft gray pill gliding to the selected one (or `segmented`, a white pill on a gray track), or the site's pills with a blue-outlined pill gliding between them."
kinds: [tabs, app-tabs]
use_for: "Two to six sibling views. `size=\"sm\"` in dense cards, `pill` on the site, `glide={false}` when your triggers draw their own selected surface."
never: [Tabs for actions, Underlined tabs]
source: src/components/dashboard-ui/tabs.tsx; src/components/dashboard-ui/hooks/use-tab-glide.ts; src/components/sections/faq.tsx (site pill tabs)
---
