---
name: scrape-reliability
title: Scrape reliability
type: site
surface: site
description: "Success-rate card, a request log in a dot window, and three cards on what runs on every request."
kinds: [card, card-ring]
use_for: The home page's reliability section ("Every page, fully loaded."), between the product grid and the use cases. The rate, the request log (steps with a time, a mark and a detail, a blocked step drawn as a ring) and the three pillars take the site's copy by default; pass your own through props.
never: [A green check or red cross in the log (a solid dot for a step that went through, a ring for one that was blocked), A chart in place of the single figure, More than three pillars, Bold figures]
source: src/components/sections/home/scrape-reliability.tsx; src/components/sections/shared/dot-window.tsx; src/lib/scrape-reliability.ts; src/components/sections/home/homepage.tsx
---

The rate card and the log sit side by side from lg (0.8 to 1.4), stacked below; the pillars go three across from md.
The log's times and details hide on phones, leaving the mark and the step.
