---
name: news-landing-visuals
title: News page visuals
type: site
surface: site
description: "The News page's hero demo and capability panels: a company in and its newest coverage out."
kinds: []
use_for: "The News product page (context.dev/news): NewsHeroDemo under the hero, and NewsEntityPanel, NewsCoveragePanel, NewsSourcePanel as the pictures in its three capability cards (ProductStorySection), in that order."
never: [A dot story and a panel in the same card, Bold names or titles, Syntax colors in the output]
source: src/components/sections/products/news-landing-visuals.tsx; src/components/sections/products/product-landing-content.tsx
files: [components/site/news-landing-visuals.tsx]
---

NewsHeroDemo is a ProductDemoCard with a company in and its newest coverage out. The panels show the ways to name a company, the coverage filters, and an article with its source. Each takes its example values as
props where a page would change them, and keeps the site's illustrative ones by default.
