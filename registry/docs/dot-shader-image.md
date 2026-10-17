---
name: dot-shader-image
title: Dot shader image
type: visual
surface: site
description: "Any picture (a logo, icon or product shot) redrawn as brand artwork by the dot shader: a component that shades the image in the browser into hollow and solid circles over a faint ring backdrop, on white, blue or black. Not an icon: for the dashboard's tiny static dot icons see Dot icon (dot-glyph)."
files: [components/visuals/dot-shader-image.tsx]
kinds: []
use_for: "Brand imagery from any picture: `src` (a logo, icon or product shot, best as a PNG with a transparent background), `surface` (`white`, `blue` or `black`) and an optional `size`. Pass `states` to draw dots shaded elsewhere. Graphics sit behind or beside content."
never: [Graphics behind body text, The image in its own colors next to the dots, Remote images without CORS]
source: src/components/sections/brand/image-dot-shader.ts and the preview in src/components/sections/brand/dot-shader-playground.tsx
---

The image is shaded in the browser. Until it is, or if it cannot be read, the surface and its ring backdrop rest on
their own; the dots then fade in once (200ms, ease-out), with no transition under reduced motion. Colors are brand
tokens (`--ds-color-brand`, `--ds-color-white`, `--ds-color-black`), so a theme applies. Give `alt` when the picture
carries meaning; without it the picture is decorative.
