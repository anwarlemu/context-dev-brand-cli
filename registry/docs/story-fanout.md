---
name: story-fanout
title: Fanout story
type: visual
surface: site
description: "Dot animation of one question fanning out into three parallel searches."
kinds: []
use_for: "Query fanout on a search product card (the Search page shows it first under its capabilities). Plays only on screen; shows its resting picture with reduced motion."
never: [Stories as the main content of a page]
source: site src/components/sections/products/fanout-story.tsx; src/components/sections/products/fanout-story-player.ts; src/components/sections/products/fanout-story-scenes.ts
files: [components/visuals/stories/fanout-story.tsx, components/visuals/stories/fanout-story-player.ts, components/visuals/stories/fanout-story-scenes.ts]
---

A question is typed into the field, a stem drops from it and branches into three search fields, each with its own query, and their ranked result rows sweep in together. The labels name the option (`queryFanout: true`) and the outcome (3 searches in parallel).
