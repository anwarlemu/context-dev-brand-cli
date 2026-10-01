---
name: hero
type: block
version: 1.2.0
use_for: Top of a marketing page. One message, one filled primary action, one outline secondary.
never:
  - Two primary CTAs
  - Headline over 12 words
  - Badges or eyebrows stacked above the headline; one eyebrow line at most
  - Gradients, glass or water behind the hero
  - More than 3 check items
props: "variant?, eyebrow?, headline, highlight? (phrase inside headline), sub, primaryCta { label, href }, secondaryCta? { label, href }, media? ({ type: demo, action? } | { type: agent-setup, prompt } | { type: code, title, code } | { type: none }), checks? (max 3), stats? (centered only)"
variants: [centered, product]
copy_rules: voice.md#mechanics
dependencies: [section, button, code-window, demo-input, dot-panel, hero-dot-field, dot-engine, section-heading, cx]
example: hero.example.tsx
---

`centered` for the homepage and pricing: text centered over the live dot field with the logo cut
from it; `stats` adds the four floating stat morphs on wide screens. `product` for API
pages: text left, one code sample right. The highlight is one phrase inside the headline, shown in
blue. The primary action is the only filled button on the page; the agent path ("Onboard your
agent") is `secondaryCta`. Media sits on the blue dot-panel: `demo` is the homepage job picker with
its Doto-typed input and the checks under it; `agent-setup` shows the setup prompt instead.
