---
name: product
type: template
version: 1.0.0
route: /product
use_for: A page for one API (Search, Scrape, Research, Monitors, Map, Crawl, Batches, Brand). What it returns, the code, how to start.
structure:
  slots:
    nav: { allowed: [nav], default: nav, required: true, max: 1 }
    hero: { allowed: [hero], default: hero, required: true, max: 1 }
    proof: { allowed: [logo-wall], default: logo-wall, required: false, max: 1 }
    features: { allowed: [feature-trio], default: feature-trio, required: true, max: 1 }
    showcase: { allowed: [code-showcase], default: code-showcase, required: true, max: 1 }
    steps: { allowed: [steps], default: steps, required: true, max: 1 }
    faq: { allowed: [faq], default: faq, required: true, max: 1 }
    related: { allowed: [related-products], default: related-products, required: true, max: 1 }
    cta: { allowed: [cta-band], default: cta-band, required: true, max: 1 }
    footer: { allowed: [footer], default: footer, required: true, max: 1 }
  forbidden: [dialog, toast, carousel]
never:
  - The water or glass hero from the old product pages
  - A code sample that does not run against the real API
  - More than one API per page
copy_rules: voice.md#mechanics
dependencies: [section]
---

Use `--out app/<api>/page.tsx`. The hero is `variant="product"` with the shortest working SDK call
as `media`. feature-trio says what you control, code-showcase shows the full request and response,
steps go from first request to a working feature, related-products links two neighbouring APIs.
