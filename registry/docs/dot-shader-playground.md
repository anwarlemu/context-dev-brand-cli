---
name: dot-shader-playground
title: Dot shader playground
type: visual
surface: site
description: "The brand page's interactive tool for the dot shader: a large shaded preview on white, blue or black, sample images, upload by click, drop or paste, and Copy SVG, SVG and PNG downloads."
files: [components/visuals/dot-shader-playground.tsx]
kinds: []
use_for: "A brand or press page section that lets visitors shade their own image. `samples` (id, label and the `src` of a shader SVG, or any image) and `defaultSample` come from the app."
never: [Uploading the visitor's image anywhere (it stays in the browser), More than one playground on a page (paste goes to every one)]
source: src/components/sections/brand/dot-shader-playground.tsx; src/components/sections/brand/dot-shader-samples.ts; src/app/(marketing)/brand/page.tsx (Graphics)
---

On the brand page it sits under the "Shader Graphics" heading, two columns of preview beside the panel on large
screens. Downloads and the copied SVG carry plain colors read from the brand tokens when they are made, so the files
work outside the page. Samples that are shader SVGs are read straight back into dots; any other image is shaded.
