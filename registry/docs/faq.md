---
name: faq
title: FAQ section
type: site
surface: site
description: "FAQ section with categories, expandable answers, and a contact action."
kinds: [faq, tabs, card]
use_for: The FAQ on the home, pricing and product pages. FaqList alone for a single list without tabs, FaqCardGrid for two columns of cards, FaqPlainList for a product page's hairline list in one card.
never: [Bold questions, Open answers by default in the card stack, Gray card backgrounds, A spread shadow for the ring (it rounds the ring's outer edge too far), Wiring the ask card to a service inside the component]
source: src/components/sections/faq.tsx; src/components/sections/faq-card.tsx; src/components/sections/faq-cards.tsx; src/components/sections/faq-ask-card.tsx; src/components/sections/faq-toggle-dots.tsx; src/components/sections/faq-home-header.tsx; src/components/sections/use-reserved-faq-height.ts; src/components/sections/products/landing-faq-list.tsx; src/styles/globals.css (details.faq-card, .faq-scroll-fade, .brand-glass-ring)
---

Each card sits in the soft blue glass ring, a wrapper 8px wider than the card so the ring's outer edge keeps the card's
radius. The whole card turns light gray on hover (only where hovering is real), and opening one closes the others.

`sizing` decides what an opened answer does to the page:

- `reserved` (the default, as on the home and pricing pages) measures every answer and holds room for the tallest, so
  opening one or switching category never moves the sections below. Beside the list, the `aside` stays level with the
  last card (it reads `--faq-reserved-room`). Stacked in one column, the room is not held.
- `closed` fixes the list at its height with every answer closed and scrolls inside it. A card that finishes opening
  scrolls into view, and the top or bottom edge fades where more cards continue.
- `stacked` keeps every category at the tallest one's height and lets an answer grow the list; `content` lets the list
  grow with each tab and answer.

The ask card waits for three characters; pass `onAsk`, then `pending` while you fetch, and `answer` or `error`.

Motion: an answer's height opens over 250ms on the ease-in-out curve while its fade runs 200ms (Context.dev's timings);
the category pill glides on the tabs' spring. Reduced motion keeps only the fades and scrolls without smoothing.
