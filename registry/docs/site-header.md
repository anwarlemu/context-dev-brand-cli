---
name: site-header
title: Site header
type: site
surface: site
description: "Site navigation with desktop dropdowns, a mobile menu, and a compact scrolled state."
kinds: [header, header-scrolled, nav-link, header-action]
use_for: The top of every site page, once. Links take `{label, href}`; menus take a `panel` (`NavLinksPanel` with a `NavFeaturedCard` and a "Build with" strip, `NavPreviewPanel` for use cases, `NavStoriesPanel` for customer stories) and a `width`, plus `mobile` groups for the phone menu (each link's `icon` a `MenuGlyph`, held to a 32px tile; without `mobile` the menu's items carry their glyphs or icon tiles). `announcement` draws an `AnnouncementBar` above it; `surface="brand"` when the hero behind it is blue.
never: [A white or blurred bar at the very top of the page, More than two buttons at the right, Bold nav links, A drawer instead of the full-screen phone menu, The header inside the product]
source: src/components/sections/shared/header.tsx; src/components/sections/shared/nav-menu-panels.tsx; src/components/sections/shared/marketing-header-frame.tsx; src/components/sections/shared/marketing-header-frame.module.css; src/components/mobile-navigation.tsx; src/components/mobile-navigation.module.css; src/components/ui/glide-hover.tsx; src/components/sections/shared/dark-cta-link.tsx
---

The bar's card is its own layer: the ring is its fill and the white card is inset by the ring's width, so the ring's
outer edge keeps the card's radius. Scrolled, the corners ease to 3rem. The links, logo and buttons keep the pill's inner
width in both states, so nothing moves while the bar morphs.

Nav links share one gray highlight that slides to the hovered link (`GlideHover`). A menu opens on hover or click, and
`ArrowDown` moves focus into it; `Escape` closes it and returns focus to its trigger. Moving between triggers slides the
panel track and morphs the panel's size; a horizontal swipe or trackpad gesture over the bar steps through the menus.

The phone menu fills the screen under the bar between two rails, wipes down, and its rows rise in a short stagger; the
rest of the page goes inert, focus stays in the header and the page does not scroll. Menus open as sections in place,
one at a time.

Motion: the panel opens over 300ms (Context.dev's 300ms); switching menus and the bar's morph run 300ms here where the
brand's site uses 400ms and 500ms, and the phone menu's rows rise over 300ms where the site uses 420ms. Everything is
still with reduced motion.

The menus hang in a solid blue 10 ring on either surface. The Products and Use Cases panels are
`min(920px, calc(100vw - 8rem))` and `min(920px, calc(100vw - 12rem))` wide, Customers 610px.
