---
name: blog-cards
title: Blog cards
type: site
surface: site
description: Tall post cards, cover on top and date, title and summary below, alternating white and brand blue, a translucent white ring on hover, and the home page's dark Latest updates band that holds them.
kinds: [card, chip]
use_for: The latest posts on the home page (`BlogSection`, six at most), a blog index or a related-posts row (`BlogCards`). Pass the dot-art cover as `cover`.
never: [Photo covers with their own colors, Gray card backgrounds, Moving cards on hover, More than two lines of title or summary]
source: src/components/sections/home/blog.tsx; src/components/sections/home/blog-card-palettes.ts; src/components/sections/home/blog-cover-art.tsx
---
