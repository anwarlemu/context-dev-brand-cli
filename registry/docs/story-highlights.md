---
name: story-highlights
title: Highlights story
type: visual
surface: site
description: "Dot animation of a search result whose most relevant passage is highlighted."
kinds: []
use_for: "Result highlights on a search product card (second of the Search page capabilities). Plays only on screen; shows its resting picture with reduced motion."
never: [Stories as the main content of a page]
source: site src/components/sections/products/highlights-story.tsx; src/components/sections/products/highlights-story-player.ts; src/components/sections/products/highlights-story-scenes.ts
files: [components/visuals/stories/highlights-story.tsx, components/visuals/stories/highlights-story-player.ts, components/visuals/stories/highlights-story-scenes.ts]
---

A result card builds from the top with its source, title and a high relevance chip, then a marker runs down beside the middle of the passage and its three lines fill in, one after another.
