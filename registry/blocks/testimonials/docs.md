---
name: testimonials
type: block
version: 1.1.0
use_for: Three short customer quotes with name, role and a link to the case study.
never:
  - Anonymous or invented quotes
  - Star ratings, avatars with gradients, or carousels
  - Quotes over 50 words
props: title, highlight?, quotes ({ quote, name, role, href? }[], 3)
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, card, button]
example: testimonials.example.tsx
---

Quotes are verbatim and approved by the customer. Pick quotes with a specific result (time to
integrate, activation, what they replaced), not general praise.
