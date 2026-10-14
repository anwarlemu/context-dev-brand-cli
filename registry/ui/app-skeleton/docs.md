---
name: app-skeleton
type: ui
surface: product
version: 1.0.0
use_for: Loading states. Skeleton is one shimmering block; LoadingGate swaps a page's skeleton for the page when its data arrives.
never:
  - Spinners for a page or card that is loading; draw its skeleton instead
  - A generic skeleton (three gray bars) that does not match the page; nothing may move when the data lands
  - A skeleton that guesses wrong; when the page cannot know which layout it will show (empty state or list), leave the area blank until it can
  - Text like "Loading..." on the page; the gate carries role="status" and the label for screen readers
props: Skeleton className?. LoadingGate isLoading, skeleton, fadeOnly?, children
states: [loading, loaded]
dependencies: [cx]
example: app-skeleton.example.tsx
---

Skeleton is `bg-subtle` (neutral-5) with a `shine` highlight sliding across on transform, 1.4s
linear and infinite (constant motion, so linear). Reduced motion hides the shine and keeps the
gray block. Default corners are `rounded-control-sm`; round each block like what it stands in for
(`rounded-control` for buttons, `rounded-pill` for chips and avatars, `rounded-window` for cards).

Build one skeleton per page, mirroring the real layout block for block:
- the same page column and the same vertical centering;
- the header as blocks: title `h-7 w-32`, subtitle `h-4 w-72`, centered;
- each card as a `glass-card` holding blocks at the card's real height;
- text lines `h-3` to `h-4`, two-line paragraphs as a full and a 3/5 line;
- the sidebar shows its own skeleton for as long as the page beside it, so both fill in together.

LoadingGate states: `loading` renders the skeleton with role="status". `loaded` renders the page
with `content-in` (opacity plus 4px rise, 200ms ease-emphasized), or `fade-in` (150ms) with
`fadeOnly` on pages whose cards use `rise-in`.
