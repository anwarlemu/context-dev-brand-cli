---
name: app-scroll-area
type: ui
surface: product
version: 1.0.0
use_for: A panel or card body that may run taller than its space (parameters panel, long lists, onboarding steps). Fades at the edges with more beyond, and offers a chevron to scroll on.
never:
  - A visible scrollbar inside a card; it takes room on one side and the padding stops being even
  - Arrows or "show more" buttons for content that should simply scroll
  - Using it for the page itself; page scrollers use scrollbar-thin scrollbar-stable
props: className?, children
states: [fits, more-below, more-above, both]
dependencies: [cx]
npm: [lucide-react@^1.51.0]
example: app-scroll-area.example.tsx
---

It fills its flex parent (`min-h-0 flex-1`), so give the parent a height or a flex column.

States follow the scroll position, measured on scroll and on resize:
- `fits`: no mask, no chevron.
- `more-below`: the bottom 28px fades out, and a 24px round chevron (`bg-surface`, `shadow-card`)
  sits 4px off the bottom; clicking it scrolls 80% of a screen, smoothly.
- `more-above`: the top 28px fades out.
- `both`: both edges fade.

The chevron appears and leaves with opacity plus 4px of travel, 200ms ease-emphasized; reduced
motion keeps the fade only. It is hidden from screen readers and the tab order; the content
itself scrolls with the keyboard. The scrollbar is hidden in every browser.
