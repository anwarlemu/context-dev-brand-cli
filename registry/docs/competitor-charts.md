---
name: competitor-charts
title: Competitor charts
type: site
surface: site
description: "The benchmark card: mono folder tabs (Success rate, Latency, Cost vs success) over dot-meter charts on the brand's faint rings, the brand in blue and others in gray."
kinds: [tabs, card-ring]
use_for: Benchmarks against competitors. Mark the brand's provider with `highlight`; name every provider by logo and label.
never: [A color per competitor, Unverified numbers in production, Charts that move under reduced motion]
source: src/components/sections/home/competitor-charts.tsx; src/components/sections/home/competitor-comparison.tsx; src/components/sections/home/competitor-benchmark-data.ts
---

The tabs cycle every `cycleMs` while the card is on screen, a small ring filling on the open tab, and pause while a
mark is hovered or focused so its tooltip can be read. The open tab's white folder glides on the tabs' spring. Latency
meters are two rows of dots, as many as fit the plot's width, filling a little faster as they go.

Motion: dots fill over 300ms in a stagger; cost marks grow in over 300ms from 90% where the brand's site uses 500ms from
60%. The brand sets values in the dot face at bold; the library keeps them at medium (the brand rules allow no bold).
Nothing moves or cycles with reduced motion.
