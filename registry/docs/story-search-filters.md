---
name: story-search-filters
title: Search filters story
type: visual
surface: site
description: "Dot animation of a freshness calendar and domain and country filters."
kinds: []
use_for: "Search filters on a search product card (third of the Search page capabilities). Plays only on screen; shows its resting picture with reduced motion."
never: [Stories as the main content of a page]
source: site src/components/sections/products/search-filters-story.tsx; src/components/sections/products/search-filters-story-player.ts; src/components/sections/products/search-filters-story-scenes.ts
files: [components/visuals/stories/search-filters-story.tsx, components/visuals/stories/search-filters-story-player.ts, components/visuals/stories/search-filters-story-scenes.ts]
---

The last week of a calendar fills in while `last_week` is typed under it, then the filters beside it arrive in turn: the domains to include, one to exclude (crossed out), and a country.
