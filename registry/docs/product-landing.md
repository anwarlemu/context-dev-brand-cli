---
name: product-landing
title: Product landing sections
type: site
surface: site
description: A product page on the home page's design, in the ruled column. Story card sections (three capabilities, two workflows), each a white card in the soft blue ring with a demo window, a code section with an install pill and a docs pill, and an FAQ in one ringed card.
kinds: [demo-panel]
use_for: The main product pages (Scrape, Map, Batches, Monitors, Answers, Brand, Style guide). Open with the site's Hero and LogoStrip, then ProductStorySection (capabilities), ProductIntegration, ProductStorySection columns={2} (workflows), ProductFaq, and close with ClosingCta. The alternatives pages reuse ProductFaq.
never: [Cards without the soft blue ring, A black pill in the code section (the docs link is the outline pill), Opening every FAQ answer, Centered section headings]
source: src/components/sections/products/product-landing-page.tsx (+ product-landing-content.ts, landing-faq-list.tsx); src/components/sections/home/product-demo-panel.tsx; src/components/sections/home/story-stage.tsx
---
