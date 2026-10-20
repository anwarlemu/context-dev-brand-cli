---
name: story-faq-invite
title: FAQ invite story
type: visual
surface: site
description: "Dot animation of an Ask anything banner that folds into a paper plane."
kinds: []
use_for: "Under the FAQ section's intro, on the ring pattern (FaqSection shows it by default). Plays only on screen; shows the banner with reduced motion."
never: [Stories as the main content of a page]
source: site src/components/sections/faq-demo-invite.tsx; src/components/sections/faq-demo-story-player.ts; src/components/sections/faq-demo-story-scenes.ts
files: [components/visuals/stories/faq-invite-story.tsx, components/visuals/stories/faq-invite-story-player.ts, components/visuals/stories/faq-invite-story-scenes.ts]
---

The banner types "Ask anything", melts into a paper plane, and the plane draws back and flies off by the top right
corner. Its grid covers the whole of its ring pattern, so the plane can leave by the pattern's own corner; the banner's
bottom edge sits on the grid's last row, level with the foot of the FAQ list beside it.
