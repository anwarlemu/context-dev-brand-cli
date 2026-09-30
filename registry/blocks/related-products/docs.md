---
name: related-products
type: block
version: 1.0.0
use_for: Two neighbouring APIs at the end of a product page, as linked cards.
never:
  - More or fewer than 2 items
  - Linking the page's own API
  - Arrow icons; the hollow dot fills on hover
props: items ({ title, text, href }[], exactly 2)
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, card]
example: related-products.example.tsx
---

Pick the two APIs people most often use next to this one. The whole card is the link.
