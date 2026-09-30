---
name: nav
type: block
version: 1.0.0
use_for: The top navigation on every marketing page. Logo, five links, "Book demo", "Start for free".
never:
  - More than 6 links
  - Mega menus with icons or illustrations
  - A second filled button in the nav
  - Sticky navs with shadows or blur
props: links ({ label, href }[]), demoCta? { label, href }, primaryCta { label, href }
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, button, logo]
example: nav.example.tsx
---

The nav's "Start for free" is the site-wide primary action and is not counted against the page's
single primary. On mobile the links collapse into a native details menu, no script needed.
