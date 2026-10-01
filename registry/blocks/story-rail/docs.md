---
name: story-rail
type: block
version: 1.2.0
use_for: Customer stories as a horizontal row of blue cards the visitor scrolls themselves.
never:
  - Autoplay, timers or a carousel library
  - Stories without a named company and a link to the full story
  - More than 8 stories
props: title, highlight?, sub?, action? { label, href }, stories ({ company, date, summary, href, art (dot pattern rows), logoSrc? (same-origin logo image) }[])
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, card, button, dot-grid, customer-logo-dots, dot-engine]
example: story-rail.example.tsx
---

Native horizontal scroll with snap points, so it works with touch, trackpad and keyboard and needs
no JavaScript. Each card is a blue Card. With `logoSrc` the customer's logo is sampled into the dot grid and
morphs on hover, as on the site; without it, `art` is drawn as a static dot pattern. Keep summaries to
one outcome with a number where there is one.
