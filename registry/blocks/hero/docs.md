---
name: hero
type: block
version: 1.1.0
use_for: Top of a marketing page. One message, one filled primary action, one outline secondary.
never:
  - Two primary CTAs
  - Headline over 12 words
  - Badges or eyebrows stacked above the headline; one eyebrow line at most
  - Gradients, glass or water behind the hero
  - More than 3 check items
props: "variant?, eyebrow?, headline, highlight? (phrase inside headline), sub, primaryCta { label, href }, secondaryCta? { label, href }, media? ({ type: agent-setup, prompt } | { type: code, title, code } | { type: none }), checks? (max 3), stats? (centered only)"
variants: [centered, product]
copy_rules: voice.md#mechanics
dependencies: [section, button, code-window, hero-dot-field, dot-engine, ring-backdrop, section-heading, cx]
example: hero.example.tsx
---

`centered` for the homepage and pricing: text centered over the live dot field with the logo cut
from it; `stats` adds the four floating stat morphs on wide screens. `product` for API
pages: text left, one code sample right. The highlight is one phrase inside the headline, shown in
blue. The primary action is the only filled button on the page. The agent path ("Onboard your
agent") goes in `secondaryCta` with the setup prompt as `media`.
