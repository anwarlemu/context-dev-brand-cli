---
name: blog-index
title: Blog index
type: site
surface: site
description: "Blog index page with a hero, category pills, a grid of post cards, links to more writing, and the closing call to action."
kinds: [section, section-heading, chip, card]
use_for: The blog's index (or a category page of it). The hero takes the site Hero's props (`size="large"`, a `HeroFrame` unless `heroBackground` passes the dot field with streams, the post count's monitor as `media`, one `pill` as `actions`); `logos` (a LogoStrip) sits under it. Then the ruled section with its heading, `categories` as pills (links with `href`, a page per category as the site does, or in-place filters with `onCategoryChange` and each post's `category`), the posts as BlogCard (white and blue in turn, `tone="light"`), `links` as outline pills to guides and the archive, and `cta` (a ClosingCta) last. BlogCategoryPills is the pill row alone.
never: [Tags on the index cards, A dark band behind the posts (that is the home page's BlogSection), More than one row of outline pills, A selected pill in blue (it is black)]
source: src/app/(marketing)/blog/page.tsx; src/app/(marketing)/blog/layout.tsx; src/components/marketing-filter-pills.tsx; src/components/blog-card.tsx; src/components/sections/home/blog-card-palettes.ts; src/components/sections/products/product-landing-page.tsx
---

The selected pill is one black surface that glides between options with the library's spring (useTabGlide); with
reduced motion it jumps. The other pills change only their fill on hover, in 200ms. Posts that do not match the selected
category are left out; a category with none shows `emptyMessage`.
