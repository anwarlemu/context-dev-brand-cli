---
name: footer
type: block
version: 1.1.0
use_for: The site footer on black. Logo, tagline, four link columns, compliance, status, legal links, dotted watermark.
never:
  - More than 4 link columns
  - Removing Terms, DPA or Privacy
  - Social icons as images; use text links
props: tagline, columns ({ title, links ({ label, href }[]) }[]), legal ({ label, href }[]), compliance?, status? { label, href }, copyright
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, logo, footer-watermark, dot-engine]
example: footer.example.tsx
---

The white logo on black is an approved colorway. The giant dotted context.dev wordmark lights up
under the pointer and holds still with reduced motion. Column titles are sentence case, links are plain text.
