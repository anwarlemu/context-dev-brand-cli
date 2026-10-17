---
name: use-hover-dot-morph
title: Hover dot morph
type: lib
surface: both
description: Plays a dot morph on a canvas while its card is hovered or focused, and lets it settle back home after. The card is the nearest link or button, or the nearest element marked `data-hover-morph` when it is neither.
files: [components/visuals/use-hover-dot-morph.ts]
kinds: []
use_for: A dot picture that changes when its card is pointed at (CustomerLogoDots, PagesCover, GlyphMelt). Pass a lazy `load` that returns a player from `createDotMorphPlayer`.
never: [A hover morph with no link, button or data-hover-morph around it, Playing under reduced motion]
source: src/components/sections/shared/use-hover-dot-morph.ts; src/components/dashboard-ui/dots/use-hover-dot-morph.ts
---
