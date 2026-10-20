---
name: pricing
title: Pricing
type: site
surface: site
description: "Pricing cards, billing interval selection, plan comparisons, discounts, and credit cost tables."
kinds: [card, chip, table]
use_for: "A pricing page or section. Plans come in as props: PricingShelves (or PricingGrid) around PricingCards, PricingToggle above, PricingPlanFit in the second row, PricingBanner under it; CreditCostsTable lists what each API costs."
never: [More than one filled call to action in the grid, Colored or gradient plan cards, Bold text other than the heavy Doto price, Hiding the overage rate]
source: src/components/pricing/PricingConcepts.tsx; src/components/pricing/MarketingPricingCard.tsx; src/components/pricing/marketing-pricing-card-styles.ts; src/components/pricing/ApiCreditCostsTable.tsx; src/components/pricing/PricingPageContent.tsx; src/components/pricing/DashedHairlines.tsx
---

Every card has the same five parts (header, price, call to action, the quota box, the feature box), and on wide
screens the cards share their rows through subgrid, so every part lines up across a row. Figures in quota and feature
lines are picked out in brand blue, and the price is the site's heavy Doto figure (`font-heavy`, 800). Only the most popular plan's button is filled (the black `pill`); the rest are
`pill-outline`.

`PricingShelves` is the pricing page's layout: row one holds Free and every self-serve plan but the largest, a short
white band follows, and row two puts the largest plan and Enterprise on the right with `PricingPlanFit` ("Which plan fits
your page volume?") across the columns they leave free. Phones stack the cards and put the panel last.

A quota line can show a short form with the full text as its label: `{ text: "100 concurrent", label: "100 concurrent
requests" }`.

Motion: the toggle's pill glides on the tabs' spring, as on Context.dev's site, and jumps with reduced motion.
