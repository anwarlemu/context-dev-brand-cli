---
name: footer-watermark
title: Footer watermark
type: visual
surface: site
description: The wordmark across the footer's foot, rebuilt from the brand's circles ("context." in rings, "dev" in solid dots); a soft patch follows the pointer and swaps the two. A dotted cursor clicks the button set on the wordmark, then glides onto the letters.
files: [components/visuals/footer-watermark.tsx, components/visuals/footer-watermark-dots.ts]
kinds: []
use_for: The dark band at the very bottom of the site footer, filling it. Pass `outlined` and `solid` for another wordmark; mark a button beside it with the cursor origin attribute for the cursor.
never: [The watermark on a light background, A watermark anywhere but the footer]
source: src/components/sections/shared/footer-watermark.tsx; src/components/sections/shared/footer-watermark-dots.ts; src/components/sections/shared/CursorClickIcon.tsx
---
