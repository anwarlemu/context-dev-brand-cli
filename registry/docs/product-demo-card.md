---
name: product-demo-card
title: Product demo card
type: site
surface: site
description: "A product page's hero demo: the input on the left and the API's output on the right, in a blue-10 ring, with the rows, chips and panels the demos are built from."
kinds: []
use_for: "Under the hero of a product page whose demo is a request and its response (Parse, News, Brand search, People enrichment). CapabilityPanel is the picture in a capability card when no dot story fits; ParamRow, StatusChip, FileGlyph, MarkGlyph and DemoRow fill it. The per-product demos are parse-landing-visuals, news-landing-visuals, brand-search-landing-visuals and people-enrichment-landing-visuals."
never: [Syntax colors in the output (it is plain black mono), A second blue ring inside the card, Bold titles in a row, Icons that move on hover]
source: src/components/sections/products/product-demo-card.tsx
files: [components/site/product-demo-card.tsx]
---

The ring is 12px at every root (`rounded-demo`) around a white card with an 8px corner. From `lg` the input column is 420px wide
beside the output, which opens with a 52px header (its label and the file name in brand blue) over the response in 13px
mono (14px from `sm`). The demo's type is fixed px (`text-demo-*`, `leading-demo-*`), as on the site, so it reads the
same at the 90% desktop root and on phones. The output is focusable so it can scroll by keyboard.
