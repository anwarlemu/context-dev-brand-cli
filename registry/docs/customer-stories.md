---
name: customer-stories
title: Customer stories
type: site
surface: site
description: "Scrollable customer story cards with drag, arrow, and pagination controls."
kinds: [card]
use_for: Case studies on the home and customers pages, and in a grid on the customers listing (the card alone). `tone` sets the controls for a white or a dark section; `showRules` draws the dotted rules above and below the row.
never: [Per-customer card colors, Autoplay, Scroll-jacking the page, More than one call to action per card]
source: src/components/sections/shared/CustomerStoriesCarousel.tsx; src/components/sections/shared/CustomerStoryCard.tsx; src/components/sections/shared/CustomerStories.tsx
---
