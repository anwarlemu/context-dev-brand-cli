---
name: product-page
title: Product page (stage)
type: site
surface: site
description: "Product page layout with a hero, demo, metrics, capabilities, code examples, steps, comparisons, and related products."
kinds: [stat]
use_for: A retained stage layout for a product page that leads with a picture of the product. Current public Search and Scrape pages use the white Hero and product-landing sections; start there when matching the live site. Pass the stage's picture as children and the glass texture as `backdrop`. ProductReliability is the Scrape page's reliability section. Code explorers on one page share the chosen language (remembered where storage allows).
never: [Ringed white cards (this design uses gray panels and hairlines), More than one blue figure in ProductStats, A third pill in the hero, Syntax themes in the code explorer beyond the site's light highlighting]
source: src/components/sections/products/product-page.tsx; product-page-layout.tsx; product-stage-hero.tsx; product-page-sections.tsx; product-code-explorer.tsx (+ code-language-store.ts); product-reliability.tsx
---
