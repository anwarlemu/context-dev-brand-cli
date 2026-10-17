---
name: image-dot-shader
title: Image dot shader
type: lib
surface: site
description: The brand kit's dot shader as plain functions. An image in, one dot state per cell of the 80 by 60 grid out (solid, hollow or none), and the picture as an SVG string.
files: [components/visuals/image-dot-shader.ts]
kinds: []
use_for: "Shading an image the way the brand's artwork is drawn: `shadeImageSrc(src)` or `shadeImage(image, width, height)` in the browser, `shadePixels(pixels, region)` on raw pixels anywhere, `parseShadedDots(svg)` to read a kit SVG back, `dotsSvg(states, resolveSurfaceColors(surface))` for a file. DotShaderImage and DotShaderPlayground draw with it."
never: [Changing the grid or thresholds (the pictures would stop matching the kit), Hex colors in dotsSvg calls (resolve them from the tokens with resolveSurfaceColors)]
source: src/components/sections/brand/image-dot-shader.ts; parseCoverDots in src/components/sections/home/blog-cover-dot-shader.ts
---

The grid, dot sizes and thresholds are the kit's (`scripts/blog-cover-art/dot-shader.mjs`), so a shaded upload sits
beside the official covers. A photo or screenshot without transparency has the color along its edges keyed out as the
backdrop. Remote images must allow CORS, or the canvas cannot be read.

`DOT_SHADER_SURFACES` holds the three surfaces as brand tokens (white with brand blue dots, blue or black with white
dots); inline SVG takes them as they are, and `resolveSurfaceColors` reads them as hex for a downloaded file.
