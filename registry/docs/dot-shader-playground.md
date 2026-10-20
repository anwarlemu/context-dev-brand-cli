---
name: dot-shader-playground
title: Dot shader playground
type: visual
surface: site
description: "Interactive dot-shader preview with image upload, sample images, and SVG or PNG export."
files: [components/visuals/dot-shader-playground.tsx]
kinds: []
use_for: "A tool page that lets people shade their own image into brand dots. `samples` (id, label and the `src` of a shader SVG, or any image) and `defaultSample` come from the app. The live site no longer shows it on the brand page; it lives on a staff-only Dot Shader page."
never: [Uploading the visitor's image anywhere (it stays in the browser), More than one playground on a page (paste goes to every one)]
source: src/components/sections/brand/dot-shader-playground.tsx; src/components/sections/brand/dot-shader-samples.ts; src/components/sections/brand/brand-surface-styles.ts; src/app/(dashboard)/admin/dot-shader/page.tsx
---

On the site's Dot Shader page it sits under the page title, two columns of preview beside the panel on large screens,
the two columns stretched to the same height. Every option tile (the surfaces, the samples, your image and the upload
tile) carries the hairline ring; the selected one takes the blue ring. Downloads and the copied SVG carry plain colors
read from the brand tokens when they are made, so the files work outside the page. Samples that are shader SVGs are
read straight back into dots; any other image is shaded.
