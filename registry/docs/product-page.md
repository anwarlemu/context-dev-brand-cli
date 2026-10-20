---
name: product-page
title: Product page (stage)
type: site
surface: site
description: "Product page layout with a hero, demo, metrics, capabilities, code examples, steps, comparisons, and related products."
kinds: [stat]
use_for: A retained stage layout for a product page that leads with a picture of the product. Retained, not current; context.dev's product pages (Parse, Brand search, People enrichment, News, the ChatGPT page) now open with the white ProductHero and continue with the product-landing sections, so start there when matching the live site. Pass the stage's picture as children and the glass texture as `backdrop`. ProductReliability is the Scrape page's reliability section. Code explorers on one page share the chosen language with every other code sample (useCodeLanguage).
never: [Ringed white cards (this design uses gray panels and hairlines), More than one blue figure in ProductStats, A third pill in the hero, Syntax themes in the code explorer beyond the site's light highlighting, Using it for a new product page (use ProductHero and product-landing)]
source: Retained from website c1cfbca6 (no longer on production main) src/components/sections/products/product-page.tsx; product-page-layout.tsx; product-stage-hero.tsx; product-page-sections.tsx; product-reliability.tsx; and on main product-code-explorer.tsx (+ code-language-store.ts)
---
