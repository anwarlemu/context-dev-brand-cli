# Product review rubric

`context-ds review` uses this rubric with `product.md`, `principles.md` and `voice.md` for pages
built from `app-*` items. Scores are 0 to 10. 7 is shippable with fixes, 9 is exemplary, 5 is
generic. The `brand_voice` score covers copy; `coherence` covers fit with the rest of the product.

## Hierarchy

The page answers one question. The eye lands on the centered title, its one muted line, then the
single brand button (if the page has an action), then the data. Nothing else is filled blue. Cards
on the page differ by content, not by decoration.

## Coherence across the product

Same shell, same 880px column, same card shadow, same 8px controls, same wash hover, same table
header, same dot-and-word status. A new page could sit beside the existing dashboard pages without
anyone noticing a new hand. No borders around cards, no colored
rings, no pills, no gradients or glass blur, no stray font sizes.

## Brand voice

Sentence case (product names keep their capitals), verb-first buttons, formatted numbers, short
periods ("30d"). Empty states say what the feature is for and give one action. Errors say what
failed and how to retry. No marketing claims inside the product.

## Detail quality

Every data view has loading (skeleton of the real layout), empty, error and populated states.
Spacing is even: 16px card padding, 12px around controls in parameter rows. Revealing a secret,
switching a tab or loading data shifts nothing. Tables paginate. Charts have three date ticks, no
bar borders, and one hover card. Dark theme reads as well as light. Motion is short and crisp:
150ms hovers, 150ms menus from their trigger, 200ms dialogs, nothing on keyboard actions.

## Accessibility

AA contrast in light and dark. Keyboard focus shows the brand ring. Icon buttons have labels and
tooltips. Destructive actions need a hold, not a click. Touch targets are 44px on mobile. Reduced
motion keeps fades only.

## Punch list rules

- Name the region (page, card or panel and viewport) and quote the exact copy.
- Say what breaks a product principle and the concrete fix, naming the `app-*` item to use.
- No praise. If a region is fine, leave it out.
