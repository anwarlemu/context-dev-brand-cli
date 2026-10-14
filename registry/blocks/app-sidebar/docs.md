---
name: app-sidebar
type: block
surface: product
version: 1.0.0
use_for: The product's navigation, in the app-shell's sidebar slot. Workspace switcher, search, grouped links, help links and the account menu. A drawer below md.
never:
  - A frame or border around the sidebar; it sits on the canvas, the shell fills the window
  - Group labels as headings or controls; each is a small hairline tag, always open
  - More than one active link, or a colored active state; the page you're on is a gray wash
  - Animating the list when its contents swap, or a travelling dot or sound on click
props: "workspace { name, plan?, createHref? }, groups [{ label?, items [{ title, href, icon }] }], activeHref?, footer? [{ title, href, icon }], user { name, email, links? [[{ label, href }]], logoutHref }, onSearch?. setNavOpen, useNavOpen, APP_ICONS"
states: [default, link-hover, link-active, menu-open, drawer-closed, drawer-open]
dependencies: [cx, app-block, app-icon-button, app-menu, app-theme]
npm: [lucide-react@^1.51.0]
example: app-sidebar.example.tsx
---

Icons are names from a closed list (APP_ICONS): arrow-left, boxes, chart-column, circle-help, code,
file-text, gift, globe, hash, image, key-round, layout-grid, layers, map, newspaper, palette, radar,
scan-search, search, settings, sparkles, user-round, users.

- 212px wide, `px-7`, on `bg-canvas`. Links are 32px rows, `text-body-sm`, lucide icons size-4.
- link-hover: `bg-wash/4`, text to fg, 150ms. link-active: `bg-wash/7`, medium weight, neutral-80.
  `activeHref` picks it; omitted, the longest href that prefixes the browser path wins.
- menu-open: the workspace menu drops from its corner (popover-in, origin-top-left); the account
  menu opens upward (origin-bottom-left) with links, the theme switch and a danger "Log out".
- Search dispatches `ds:open-search` unless `onSearch` is passed (wire it to a command palette).
- drawer: below md, `setNavOpen(true)` (the app-top-bar menu button) slides it in over 250ms
  ease-emphasized and out over 200ms, with a fading scrim; CSS transitions, so it turns around
  mid-way. Escape, the scrim and any link close it. Reduced motion drops the slide.
