---
name: blog-grid
type: block
version: 1.2.0
use_for: The latest six posts on a black band, cards alternating white and blue, each with animated dot cover art.
never:
  - Stock photos or cover images; post art is a dot cover motif
  - More than 6 posts
  - Dates without the year on posts older than this year
props: "title, highlight?, posts ({ title, slug, date, excerpt, href, motif? (blocked | trends | pages | integration | images | extract) }[])"
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, cx, blog-cover]
example: blog-grid.example.tsx
---

The only black section on the landing page. Cards alternate white and blue by position
(`blogCardSurface`), so the rhythm stays the same whatever the posts are. Leave `motif` out and each
post gets a cover from its title, with no repeats. Covers morph on hover and hold still with
reduced motion. Titles clamp to two lines, excerpts to two.
