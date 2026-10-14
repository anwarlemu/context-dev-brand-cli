---
name: app-dot-glyph
type: ui
surface: product
version: 1.0.0
use_for: Small icons drawn on the dot grid (the credits gem, plan marks), where a product icon should speak the brand's dot language.
never:
  - Replacing lucide icons in nav, buttons and menus; glyphs are for brand moments (credits, plans, empty-state marks)
  - Colors other than the accent (or white on brand)
  - A looping animation on a glyph nobody is pointing at, except one pop-in on a rare moment
  - Dots of mixed sizes; one pitch (3.2) and one radius (1.25) per glyph
props: rows, motion? (none | sweep | pop), dotStaggerMs? (default 40), className?, children?. GEM_GLYPH
variants: [none, sweep, pop]
states: [rest, hover, entering]
dependencies: [cx]
example: app-dot-glyph.example.tsx
---

Rows are strings: `2` solid dot (context), `1` hollow ring (open web), anything else empty. Size it
with `size-*` (16px beside a label, 32px on a plan card). Color is `currentColor`, accent by default.

Variants are `motion`:
- `none` (default): still.
- `sweep`: while the glyph's parent is hovered (hover-capable pointers only) or focused, each dot
  swells to 1.45 and settles in turn, corner to corner along --dot-delay, 1400ms ease-in-out, looping;
  it rests when the pointer leaves. Use beside an interactive label (the top bar's credits button).
- `pop`: dots pop in from scale 0.5 with opacity (360ms ease-emphasized, staggered), then pulse opacity
  every 2400ms. For a rare moment such as a plan upgrade confirmation.

Reduced motion: no sweep, no pop, no pulse; the glyph rests still.
