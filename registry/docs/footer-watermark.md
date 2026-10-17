---
name: footer-watermark
title: Footer watermark
type: visual
surface: site
description: "Dot-rendered Context.dev wordmark with pointer interaction and an animated cursor."
files: [components/visuals/footer-watermark.tsx, components/visuals/footer-watermark-dots.ts]
kinds: []
use_for: The dark band at the very bottom of the site footer, filling it. Pass `outlined` and `solid` for another wordmark; mark a button beside it with the cursor origin attribute for the cursor.
never: [The watermark on a light background, A watermark anywhere but the footer]
source: src/components/sections/shared/footer-watermark.tsx; src/components/sections/shared/footer-watermark-dots.ts; src/components/sections/shared/CursorClickIcon.tsx
---
