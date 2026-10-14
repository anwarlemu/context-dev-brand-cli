---
name: app-banner
type: block
surface: product
version: 1.0.0
use_for: A card-wide note above a list, usually a plan limit and the way past it ("You’ve used 1 of 2 API keys").
never:
  - Colored or filled banners, icons or dismiss buttons; it is a white card with words and one action
  - A brand (filled) button; the page's brand button is in the header
  - More than one banner on a page
  - Marketing claims; state the limit and what the next plan gives
props: "variant?, title, body?, action { label, href }"
variants: [default, upsell]
states: [default, action-hover]
copy_rules: voice.md#mechanics
dependencies: [app-block, app-button]
npm: [lucide-react@^1.51.0]
example: app-banner.example.tsx
---

A card (`shadow-card`, `rounded-window`, `px-5 py-4`): the fact in `text-body-sm`, one muted line
under it, the action at the right with ArrowRight. Below sm the action drops under the text.

- `default`: outline sm action ("View plans").
- `upsell`: outline-brand sm action, for an upgrade that unlocks the thing just hit ("Upgrade").
