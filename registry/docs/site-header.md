---
name: site-header
title: Site header
type: site
surface: site
description: The site's header with the announcement bar above it, nav links with dropdown panels, a black and an outline pill, and the floating white pill it becomes once the page scrolls.
kinds: [header, header-scrolled, nav-link, header-action, announcement]
use_for: The top of every site page, once. Menus take `{title, description, href, icon}` items; below the large breakpoint the links move into a drawer.
never: [A transparent header at the top of the page, More than two buttons at the right, Bold nav links, The header inside the product]
source: src/components/sections/shared/header.tsx; src/components/sections/shared/marketing-header-frame.module.css
---
