---
name: glyph-engine
title: Glyph engine
type: lib
surface: product
description: The product's dot picture engine. Glyph art, the dot field that eases each dot between states, the melt that blurs one picture into the next, the looping story player and the hover morph player, with the pages cover's scene and shader.
kinds: []
use_for: The product's glyph visuals (glyph-tile, glyph-loop, glyph-melt, glyph-story, pages-cover, upgrade-glyph, api-grid-glyph). Build a new picture from glyph-art and the story or morph players.
never: [Hex colors in canvas code (read the --ds-* variables), Playing under reduced motion or off screen]
source: dashboard src/components/dots
files: [components/visuals/glyph/cover-dot-shader.ts, components/visuals/glyph/cover-morph-engine.ts, components/visuals/glyph/cover-scenes.ts, components/visuals/glyph/dot-glyph-cells.ts, components/visuals/glyph/dot-glyph-morph.ts, components/visuals/glyph/dot-morph-dots.ts, components/visuals/glyph/dot-morph-goo.ts, components/visuals/glyph/dot-morph-player.ts, components/visuals/glyph/dot-story-beats.ts, components/visuals/glyph/dot-story-cells.ts, components/visuals/glyph/dot-story-player.ts, components/visuals/glyph/dot-story.tsx, components/visuals/glyph/dot-svg-path.ts, components/visuals/glyph/glyph-art.ts, components/visuals/glyph/glyph-loop-player.ts, components/visuals/glyph/glyph-melt-engine.ts, components/visuals/glyph/glyph-melt-holds.ts, components/visuals/glyph/glyph-story-player.ts, components/visuals/glyph/pages-cover-art.ts, components/visuals/glyph/surface-color.ts, components/visuals/glyph/upgrade-story-art.ts, components/visuals/glyph/upgrade-story-fine.ts, components/visuals/glyph/upgrade-story-player.ts, components/visuals/glyph/use-hover-dot-morph.ts]
---
