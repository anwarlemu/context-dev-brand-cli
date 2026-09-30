---
name: cta-band
type: block
version: 1.1.0
use_for: The closing section of every page. One headline, one line of sub, the free offer and one outline action.
never:
  - A filled primary button; the hero owns the page's primary
  - More than one action plus the docs link
  - A different offer from the pricing page
props: title, highlight? (phrase inside title), sub, offer { value, label, note }, cta { label, href }, docs? { label, href }
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, button, credits-dot-number, hero-dot-field, dot-engine]
example: cta-band.example.tsx
---

A ringed panel with the live hero dot field behind it. The headline, sub and offer card are
marked as holes, so the dots clear around them. The offer figure is drawn in dots and morphs into
Doto. The offer must match the pricing page word for word.
