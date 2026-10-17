---
name: story-monitor-ways
title: Monitor ways stories
type: visual
surface: site
description: "Three looping dot pictures, one per way to monitor: a page re-scraped until a line changes and its diff, a sitemap that loses one URL and gains one, and an extract instruction read into a scored record."
kinds: []
use_for: "The ways to monitor on a site product page, one picture per card. Exports `PageMonitorStory`, `SitemapMonitorStory` and `ExtractMonitorStory`. Each plays only on screen; with reduced motion they show the diff, the changed list, the scored record."
never: [Stories as the main content of a page]
source: site src/components/sections/products/monitor-ways-story.tsx
files: [components/visuals/stories/monitor-ways-story.tsx, components/visuals/stories/monitor-ways-story-player.ts, components/visuals/stories/monitor-ways-story-scenes.ts, components/visuals/stories/prompt-field.ts]
---
