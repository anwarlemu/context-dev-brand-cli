---
name: blog-cards
title: Blog cards
type: site
surface: site
description: "Post cards with a cover, date, title, and summary, plus the Latest updates section."
kinds: [card, chip]
use_for: The latest posts on the home page (`BlogSection`, six at most; `allHref` adds the "All posts" pill and `hideOnPhones` hides the band below 768px, as the home page does), a blog index or a related-posts row (`BlogCards`, `tone="light"` on a white page). Pass the dot-art cover as `cover`.
never: [Photo covers with their own colors, Gray card backgrounds, Moving cards on hover, More than two lines of title or summary]
source: src/components/sections/home/blog.tsx; src/components/blog-card.tsx; src/components/sections/home/blog-card-palettes.ts; src/components/sections/home/blog-cover-art.tsx
---
