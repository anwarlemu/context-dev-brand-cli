---
name: app-theme
type: ui
surface: product
version: 1.0.0
use_for: The product's light, dark and system themes. THEME_SCRIPT for the root layout, hooks, and the three-option theme switch.
never:
  - Branching on the theme in components; tokens re-point under data-theme, so components stay the same
  - Setting the theme after paint without THEME_SCRIPT; a dark page then flashes light
  - A theme toggle anywhere but the user menu and settings
  - Animating the switch between themes
props: "AppThemeSwitch: className?. THEME_SCRIPT, setTheme(theme), useTheme(), useResolvedTheme()"
states: [light, system, dark]
dependencies: [cx, app-tooltip]
npm: [lucide-react@^1.51.0]
example: app-theme.example.tsx
---

In the root layout: `<html className="ds-product" suppressHydrationWarning>` and, in `<head>`,
`<script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />`. The script reads `theme` from
localStorage (light, dark or system; light by default) and sets `data-theme` on `<html>` before
first paint. `setTheme` stores the pick and applies it; System follows the OS live.

`useTheme()` returns the pick (for the switch); `useResolvedTheme()` returns light or dark as
shown, for canvases that paint colors themselves.

AppThemeSwitch: a hairline track (`rounded-control border border-line p-0.5`) of three 24px icon
buttons (Sun, Monitor, Moon) with tooltips. Picked: `bg-blue-10 text-accent`. Others:
`text-fg-subtle`, `hover:text-fg` over 150ms. The theme changes at once, with no transition.
