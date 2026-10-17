---
name: customer-logo-dots
title: Customer logo dots
type: visual
surface: site
description: A customer's logo redrawn in the brand dot grid over a faint ring backdrop; inside a link, hover or focus melts it into an arrow.
files: [components/visuals/customer-logo-dots.tsx, components/visuals/customer-logo-grid.ts, components/visuals/customer-logo-morph.ts, components/visuals/use-hover-dot-morph.ts]
kinds: []
use_for: "The picture of a customer story card (`tone=\"onBlue\"` on the blue card, `onWhite` on a white panel). Remote logos need CORS or a same-origin `resolveSrc`."
never: [Logos in their own colors on a story card, A dot logo without a link around it]
source: src/components/sections/shared/customer-logo-dots.tsx; customer-logo-grid.ts; customer-logo-morph.ts; logo-dot-sampling.ts; use-hover-dot-morph.ts
---
