---
name: hero-water
title: Hero water
type: visual
surface: site
description: A WebGL water surface under a white to blue sky that ripples on its own and in the pointer's wake, or printed as a halftone dot screen. A still picture of the water shows where WebGL is missing, on small or touch screens, and under reduced motion.
files: [components/visuals/hero-water.tsx, components/visuals/hero-water-renderer.ts, components/visuals/hero-water-simulation.ts]
kinds: []
use_for: "A Hero's `background` on a launch or campaign page, with the content in the white sky above the water."
never: [Water behind dense text, Water on more than one section of a page, White text on the sky]
source: src/components/sections/shared/hero-water.tsx; hero-water-renderer.ts; hero-water-simulation.ts; hero-background.tsx
---

The site's glass look (an image refracted through the water) is not included: it needs the site's texture image.
