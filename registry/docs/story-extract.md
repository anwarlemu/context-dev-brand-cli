---
name: story-extract
title: Extract story
type: visual
surface: site
description: "A looping dot picture. A scan reads a live page, which melts into a window that steps through each output format in its tabs (Markdown, HTML, JSON, images, a screenshot and highlights), typing the text ones and building the pictures."
kinds: []
use_for: "The scrape or extract product on a site card. Plays only on screen; shows its resting picture with reduced motion."
never: [Stories as the main content of a page]
source: site src/components/sections/home/extract-story.tsx
files: [components/visuals/stories/extract-story.tsx, components/visuals/stories/extract-story-player.ts, components/visuals/stories/extract-story-scenes.ts]
---
