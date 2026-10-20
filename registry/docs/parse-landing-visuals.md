---
name: parse-landing-visuals
title: Parse page visuals
type: site
surface: site
description: "The Parse page's hero demo and capability panels: a PDF in and Markdown out, with the parse story under the file."
kinds: []
use_for: "The Parse product page (context.dev/parse): ParseHeroDemo under the hero, and ParseFileTypesPanel, ParseOcrPanel, ParseOptionsPanel as the pictures in its three capability cards (ProductStorySection), in that order."
never: [A dot story and a panel in the same card, Bold names or titles, Syntax colors in the output]
source: src/components/sections/products/parse-landing-visuals.tsx; src/components/sections/products/product-landing-content.tsx
files: [components/site/parse-landing-visuals.tsx]
---

ParseHeroDemo is a ProductDemoCard with a PDF in and Markdown out, with the parse story under the file. The panels show the file types it reads, OCR on scanned pages, and the options a request takes. Each takes its example values as
props where a page would change them, and keeps the site's illustrative ones by default.
