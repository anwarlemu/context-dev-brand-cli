---
name: product-page
title: Product page (stage)
type: site
surface: site
description: The stage design for a product page. A wide column with two-line headings (black, then blue), the product on a blue stage under the hero, a customer row, figures on a gray panel, capabilities under blue-led hairlines, a tabbed code explorer, a steps timeline, a comparison table, a hairline FAQ, related cards and a blue closing panel.
kinds: [stat]
use_for: The Search, Brand search, People enrichment, News and Parse pages, or any product page that leads with a picture of the product. Pass the stage's picture as children and the glass texture as `backdrop`. ProductReliability is the Scrape page's reliability section. Code explorers on one page share the chosen language (remembered where storage allows).
never: [Ringed white cards (this design uses gray panels and hairlines), More than one blue figure in ProductStats, A third pill in the hero, Syntax themes in the code explorer beyond the site's light highlighting]
source: src/components/sections/products/product-page.tsx; product-page-layout.tsx; product-stage-hero.tsx; product-page-sections.tsx; product-code-explorer.tsx (+ code-language-store.ts); product-reliability.tsx
---
