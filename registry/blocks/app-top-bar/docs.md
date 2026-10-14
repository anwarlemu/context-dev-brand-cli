---
name: app-top-bar
type: block
surface: product
version: 1.0.0
use_for: The bar above every product page, in the app-shell's topbar slot. The drawer's menu button (below md) and the credits menu at the right.
never:
  - A page title, breadcrumb or search in the bar; every page heads itself
  - More than the menu button and the credits; account and help live in the sidebar
  - The credits figure in Doto; it is Rethink Sans, tabular
  - A frame or border under the bar
props: "credits { left, total, resetsOn }, plan { name, price, rateLimit }, upgradeHref, usageHref"
states: [default, hover, menu-open]
dependencies: [cx, app-block, app-button, app-dot-glyph, app-menu, app-tooltip, app-sidebar]
npm: [lucide-react@^1.51.0]
example: app-top-bar.example.tsx
---

56px tall, 80px from md, level with the sidebar's workspace row. The menu button (36px, md:hidden)
calls `setNavOpen(true)` from app-sidebar.

- Credits button: the dot gem (sweeps while hovered, hover-capable pointers only) and
  "628 credits" at `text-body-sm`; hover and open lay `bg-wash/4` over 150ms.
- menu-open: a 320px glass-frame panel drops from the top-right corner (popover-in, 150ms, scale
  from 0.97): plan row on a gray well, credits remaining with the figure at `text-h4` and a 20-dot
  meter (brand filled, blue-10 empty), refresh and rate-limit rows, then brand "Upgrade plan" and
  outline "View usage", full width. Outside click and Escape close it.
