---
name: app-button
type: ui
surface: product
version: 1.0.0
use_for: Every action in the product. 8px corners, 12.6px label, sentence case, an optional leading icon.
never:
  - More than one filled button (brand or primary) in a view
  - Pills; product buttons are squareish (rounded-control)
  - An icon-only button here; use app-icon-button, which carries a tooltip
  - Destructive actions that fire on one click; use app-hold-button
props: variant?, size? (sm | md), disabled?, type?, onClick?, className?, children. appButtonClassName(variant, size) for links
variants: [brand, primary, outline, outline-brand, ghost, on-brand]
states: [default, hover, pressed, focus, disabled]
copy_rules: voice.md#mechanics
dependencies: [cx]
example: app-button.example.tsx
---

- `brand`: the one main action of a page or form ("Create API key", "Create batch", "Scrape").
- `primary`: filled black, for the main action inside a card where blue would compete ("Copy").
- `outline` (default): every other action ("Cancel", "View plans", "Read docs").
- `outline-brand`: a secondary action that should read as an upgrade or a limit ("Increase limit").
- `ghost`: quiet actions in toolbars and footers. `on-brand`: on a blue surface.
- Sizes: `md` (40px) for the main action of a page or form; `sm` (32px) in cards, rows and toolbars.

States: hover changes color only. Pressed scales to 0.97 over 150ms (none with reduced motion).
Focus shows the brand glass ring. Disabled is 50% opacity and takes no pointer events. Icons are
lucide at `size-3.5`, `strokeWidth={1.5}`, before the label.
