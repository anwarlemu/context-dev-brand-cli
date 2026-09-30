---
name: pricing
type: template
version: 1.0.0
route: /pricing
use_for: The pricing page. Plans, credit costs as a table, the FAQ that removes doubt, one close.
structure:
  slots:
    nav: { allowed: [nav], default: nav, required: true, max: 1 }
    hero: { allowed: [hero], default: hero, required: true, max: 1 }
    plans: { allowed: [pricing-table], default: pricing-table, required: true, max: 1 }
    costs: { allowed: [credit-costs], default: credit-costs, required: true, max: 1 }
    faq: { allowed: [faq], default: faq, required: true, max: 1 }
    cta: { allowed: [cta-band], default: cta-band, required: true, max: 1 }
    footer: { allowed: [footer], default: footer, required: true, max: 1 }
  forbidden: [dialog, toast, carousel]
never:
  - Plan cards for data that belongs in a table
  - More than one filled button per plan column; only the recommended plan's action is primary
  - Hidden prices ("Contact us" is only for Enterprise)
  - Testimonials or logos on the pricing page; proof lives on the landing page
copy_rules: voice.md#mechanics
dependencies: [section]
---

Every slot is required, so every pricing page has the same structure. The hero is `centered` with
no media: the headline states the pricing principle ("Straightforward, transparent pricing") and
the sub states the free tier. Plans come from the pricing-table block, costs from credit-costs.
