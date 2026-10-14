---
name: app-page-header
type: block
surface: product
version: 1.0.1
use_for: The head of every product page. Centered title, one muted sentence, the page's actions under it. A back link (forms) or breadcrumb (detail pages) above.
never:
  - A left title with right-aligned actions; product headers center
  - More than one sentence under the title, or a bold title; titles are text-h4 at the product weight
  - More than one brand button in the actions
  - A title in the top bar instead; every page heads itself
props: "variant?, title, sub?, backHref? (back), breadcrumb? { label, href, current } (breadcrumb), children (actions)"
variants: [centered, back, breadcrumb]
states: [default, link-hover]
copy_rules: voice.md#mechanics
dependencies: [cx, app-block, app-button]
npm: [lucide-react@^1.51.0]
example: app-page-header.example.tsx
---

- `centered`: `text-h4` title, `mt-1` sentence in `text-body-sm text-fg-muted` (balanced, max
  576px), actions `mt-3` centered, 8px apart. Lists and settings use it.
- `back`: "Back" (ArrowLeft, fg-subtle, fg on hover over 150ms) above, header 24px below. Forms.
- `breadcrumb`: parent link, chevron, the record's id in mono caption, header 24px below. Detail
  pages.

Title and sentence are sentence case; product names keep their capitals. The sentence says what
the page is for ("Use these keys to authenticate requests to the Context.dev API.").

With `breadcrumb` the breadcrumb heads the page and the title is kept for screen readers only.
