---
name: app-shell
type: template
surface: product
layout: true
version: 1.0.0
route: /(dashboard)
use_for: The dashboard layout. Sidebar and top bar around every product page. Scaffolds layout.tsx, not a page.
structure:
  slots:
    sidebar: { allowed: [app-sidebar], default: app-sidebar, required: true, max: 1 }
    topbar: { allowed: [app-top-bar], default: app-top-bar, required: true, max: 1 }
  forbidden: [carousel]
never:
  - A frame or card around the shell; it fills the window edge to edge on the canvas
  - A page title or breadcrumb in the top bar; every page heads itself (app-page-header)
  - Marketing nav or footer inside the shell
  - Interface sounds
dependencies: [app-theme]
---

Scaffold it into the route group that holds the product pages:
`scaffold app-shell --out "app/(dashboard)/layout.tsx"`. Pages under it start from the page
templates (app-overview, app-list, app-detail, app-form, app-settings, app-playground).

The shell carries `.ds-product`, so the product tokens apply inside it, and the root font size
drops to 15px wherever it renders. For dark mode, put `THEME_SCRIPT` from app-theme in the root
layout's `<head>` (`<script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />`) and add
`suppressHydrationWarning` to `<html>`: it sets `data-theme` before first paint.

Below md the sidebar becomes a drawer opened from the top bar's menu button.
