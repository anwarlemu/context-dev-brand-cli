---
name: brand-search-landing-visuals
title: Brand search page visuals
type: site
surface: site
description: "The Brand search page's hero demo and capability panels: a partial name in and matching companies out."
kinds: []
use_for: "The Brand search product page (context.dev/brand-search): BrandSearchHeroDemo under the hero, and BrandSearchAutocompletePanel, BrandSearchResultPanel, BrandSearchMatchingPanel as the pictures in its three capability cards (ProductStorySection), in that order."
never: [A dot story and a panel in the same card, Bold names or titles, Syntax colors in the output]
source: src/components/sections/products/brand-search-landing-visuals.tsx; src/components/sections/products/product-landing-content.tsx
files: [components/site/brand-search-landing-visuals.tsx]
---

BrandSearchHeroDemo is a ProductDemoCard with a partial name in and matching companies out. The panels show autocomplete as someone types, one result with its details, and the matching options. Each takes its example values as
props where a page would change them, and keeps the site's illustrative ones by default.
