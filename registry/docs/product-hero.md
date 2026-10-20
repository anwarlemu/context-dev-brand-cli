---
name: product-hero
title: Product hero
type: site
surface: site
description: "White product page hero with dot streams, a two-line title, pills, an optional note, and the product demo under it."
kinds: []
use_for: The hero of a product page that leads with its demo (Parse, Brand search, People enrichment, News) and of plugin pages (the ChatGPT page, with its own `actions` and a `note`). Pass the demo as children; follow it with LogoStrip and the product-landing sections. Set `--hero-header` to the header's height when the hero sits under a see-through fixed header. ProductCustomerProof, ProductSteps, ProductCompactFaq, ProductCallToAction and ProductContainer are deprecated (the retired blue water design); use LogoStrip, ProductLandingSteps, ProductFaq and ClosingCta.
never: [A blue or water background (the design is retired), An eyebrow line above the title, Arrows in the hero's pills, Centered body copy below the hero, Bold in the title, A second dot field in the band]
source: src/components/sections/products/product-hero.tsx; src/components/sections/shared/hero-dot-field.tsx; retained from website c1cfbca6 for the deprecated parts src/components/sections/products/product-customer-proof.tsx; product-workflows.tsx; product-faq.tsx; product-call-to-action.tsx; product-layout.tsx
---
