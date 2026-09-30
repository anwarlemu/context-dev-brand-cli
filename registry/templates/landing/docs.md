---
name: landing
type: template
version: 1.0.0
route: /
use_for: The homepage and campaign landing pages. One message, one primary action, the agent path next to it.
structure:
  slots:
    announcement: { allowed: [announcement-bar], default: announcement-bar, required: false, max: 1 }
    nav: { allowed: [nav], default: nav, required: true, max: 1 }
    hero: { allowed: [hero], default: hero, required: true, max: 1 }
    proof: { allowed: [logo-wall, testimonials], default: logo-wall, required: true, max: 1 }
    products: { allowed: [product-grid], default: product-grid, required: true, max: 1 }
    benchmark: { allowed: [benchmark], default: benchmark, required: true, max: 1 }
    onboarding: { allowed: [agent-onboarding], default: agent-onboarding, required: true, max: 1 }
    showcase: { allowed: [code-showcase], default: code-showcase, required: false, max: 1 }
    use_cases: { allowed: [use-case-grid], default: use-case-grid, required: false, max: 1 }
    trust: { allowed: [trust-grid], default: trust-grid, required: false, max: 1 }
    testimonials: { allowed: [testimonials], default: testimonials, required: false, max: 1 }
    stories: { allowed: [story-rail], default: story-rail, required: false, max: 1 }
    updates: { allowed: [blog-grid], default: blog-grid, required: false, max: 1 }
    steps: { allowed: [steps], default: steps, required: false, max: 1 }
    faq: { allowed: [faq], default: faq, required: false, max: 1 }
    cta: { allowed: [cta-band], default: cta-band, required: true, max: 1 }
    footer: { allowed: [footer], default: footer, required: true, max: 1 }
  forbidden: [dialog, toast, carousel]
never:
  - Two primary CTAs on the page (only the hero's primaryCta is filled)
  - A section that is not a registry block
  - Reordering sections; the template fixes the order
  - A benchmark without a link to the full comparison
copy_rules: voice.md#mechanics
dependencies: [section]
---

Mirrors the context.dev homepage. The order tells the story: what it is (hero), who trusts it
(proof), what it does (products), that it is better and cheaper (benchmark), how to start, with the
agent path first (onboarding), then depth for the evaluator (showcase to faq), and the close.

Decisions left to you: copy, and whether to keep each optional slot. Drop an optional slot with
`--slot <slot>=none` only when the page has nothing true to say there. `proof` can be
`testimonials` instead of `logo-wall` when there are fewer than six recognizable logos.
