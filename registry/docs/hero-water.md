---
name: hero-water
title: Hero water
type: visual
surface: site
description: "WebGL water background with a static fallback for reduced motion and unsupported devices."
files: [components/visuals/hero-water.tsx, components/visuals/hero-water-renderer.ts, components/visuals/hero-water-simulation.ts]
kinds: []
use_for: "A Hero's `background` on a launch or campaign page, with the content in the white sky above the water."
never: [Water behind dense text, Water on more than one section of a page, White text on the sky]
source: src/components/sections/shared/hero-water.tsx; src/components/sections/shared/hero-water-renderer.ts; src/components/sections/shared/hero-water-simulation.ts; src/components/sections/shared/hero-background.tsx
---

The site's glass look (an image refracted through the water) is not included: it needs the site's texture image.
