---
name: app-card
type: ui
surface: product
version: 1.0.0
use_for: The white card every product panel sits in. Hairline edge and soft shadow, 10px corners, optional header and footer.
never:
  - Borders or colored rings around cards; the hairline is part of the shadow
  - Gray card fills; cards are white (dark surface in dark) on the canvas
  - A second shadow style; there are two (card, raised)
  - Hover lift or scale; a clickable card answers hover with the glass ring only
props: variant?, title?, action?, footer?, href?, padded? (default true), className?, children
variants: [default, raised, interactive]
states: [default, hover, focus]
dependencies: [cx]
example: app-card.example.tsx
---

Cards float on the canvas: `shadow-card` is a 1px hairline, a crisp line of shade along the bottom
and a soft shadow beneath. `raised` is the quieter shadow for a card inside a card. `interactive`
(with `href`) wraps the card in a 4px translucent brand ring on hover and keyboard focus, over 150ms.

The header row is 48px tall with 16px sides, the title at `text-body-sm`, one action at the right
end. Padding is an even 16px. Set `padded={false}` for tables and charts that run edge to edge.
