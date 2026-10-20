---
name: product-landing
title: Product page (landing)
type: site
surface: site
description: "Product landing sections with capability cards, workflow cards, code examples, steps, related products, and an FAQ."
kinds: [demo-panel]
use_for: The product pages. Scrape, Map, Batches, Monitors, Answers, Brand and Style guide open with the site's Hero; Parse, Brand search, People enrichment, News and the ChatGPT page open with the white ProductHero (its demo as children). Then LogoStrip, ProductStorySection (capabilities), ProductIntegration (`playgroundHref` adds the playground pill beside the API reference), ProductStorySection columns={2} (workflows), ProductLandingSteps (three numbered steps), ProductFaq, ProductRelatedCards (two related products), and close with ClosingCta. The alternatives pages reuse ProductFaq; the use case pages build their API example on ProductIntegration.
never: [Cards without the soft blue ring, A black pill in the code section (the docs and playground links are outline pills), Opening every FAQ answer, Centered section headings, An arrow that moves when a related product card is hovered, More than three steps in ProductLandingSteps]
source: src/components/sections/products/product-landing-page.tsx (+ product-landing-content.ts, landing-faq-list.tsx); src/components/sections/home/product-demo-panel.tsx; src/components/sections/home/story-stage.tsx
---
