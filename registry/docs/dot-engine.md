---
name: dot-engine
title: Dot engine
type: lib
surface: site
description: The site's dot animation engine. Pictures drawn on the brand dot grid that melt, build or sweep from one to the next on a canvas, with a static SVG resting picture.
kinds: []
use_for: "Building a dot story: `DotStory` with a grid, a resting picture and a lazy `load` that returns a player from `createBeatStoryPlayer` (beats) or `createDotStoryPlayer` (any frame function). Also `DotWindow` and `DotRule` around live content, and `PauseWhenOffscreen` inside animated SVGs."
never: [Hex colors in a story (use brand tokens through canvasColor), Stories that keep playing off screen or with reduced motion]
source: site src/components/sections/shared/dot-story.tsx and its dot-* modules; products/story-caption.ts
files: [components/visuals/dot-engine/dot-story.tsx, components/visuals/dot-engine/dot-story-player.ts, components/visuals/dot-engine/dot-story-beats.ts, components/visuals/dot-engine/dot-story-cells.ts, components/visuals/dot-engine/dot-story-resting-picture.tsx, components/visuals/dot-engine/dot-morph-player.ts, components/visuals/dot-engine/dot-morph-dots.ts, components/visuals/dot-engine/dot-morph-goo.ts, components/visuals/dot-engine/dot-glyph-morph.ts, components/visuals/dot-engine/dot-glyph-cells.ts, components/visuals/dot-engine/dot-svg-path.ts, components/visuals/dot-engine/dot-window.tsx, components/visuals/dot-engine/pause-when-offscreen.tsx, components/visuals/dot-engine/story-caption.ts]
---

`DotStory` plays only while on screen and the tab is visible, loads its player the first time it scrolls into view, and
shows the resting picture instead of playing under reduced motion (followed live). Canvas code reads colors from brand
tokens: the dots take the frame's text color (`text-brand` by default), and `canvasColor(canvas, "var(--ds-color-...)")`
resolves any other token.
