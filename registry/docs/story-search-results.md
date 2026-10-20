---
name: story-search-results
title: Search results story
type: visual
surface: site
description: "Dot animation of a typed query, three ranked results and their highlighted passages."
kinds: []
use_for: "The hero of a search product page (the Search page shows it in the hero demo). Draw it in a white card on the ring pattern. Plays only on screen; shows its resting picture with reduced motion."
never: [Stories as the main content of a page]
source: site src/components/sections/products/search-results-story.tsx; src/components/sections/products/search-results-story-player.ts; src/components/sections/products/search-results-story-scenes.ts
files: [components/visuals/stories/search-results-story.tsx, components/visuals/stories/search-results-story-player.ts, components/visuals/stories/search-results-story-scenes.ts]
---

A query is typed into the field at the top, three results sweep in under it with their source, title and relevance (a filled chip for high, an outline for medium), then each passage highlights the span that answers the query.
