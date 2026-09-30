---
name: blog-cover
type: ui
version: 1.0.0
use_for: "Animated dot cover art for a post card. Six motifs, on paper (white) or blue."
never:
  - Photos or stock images as covers
  - Choosing a motif by hand when assignBlogCoverMotifs can pick it
props: "motif (blocked | trends | pages | integration | images | extract), surface (paper | blue)"
variants: []
dependencies: [dot-engine, ring-backdrop, cx]
export: BlogCoverArt
example: blog-cover.example.tsx
---

Use `assignBlogCoverMotifs(posts)` to give each post a motif from its title, without repeats, and
`blogCardSurface(index)` to alternate white and blue. `backdropStyle(surface)` is the ring tile.
