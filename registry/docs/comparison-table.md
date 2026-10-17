---
name: comparison-table
title: Comparison table
type: site
surface: site
description: A table in a white card in the soft blue glass ring, the brand's column tinted blue. `text` for answers in words under h5 heads with captions, `marks` for checks, dashes and short figures under category headings.
kinds: [table, card-ring]
use_for: "Comparing the product with an alternative: `text` on a use-case page (your own crawler against the API), `marks` for an alternatives page's full feature comparison. Mark the brand's column with `highlight`."
never: [Uppercase or bold heads, Red crosses for a missing feature (a quiet en dash), Vertical rules between columns, Gray category bands]
source: src/components/sections/use-cases/use-case-sections.tsx (UseCaseComparison); src/components/sections/alternatives/alternative-comparison-table.tsx
---

The card scrolls sideways on narrow screens and is focusable, so a keyboard can scroll it too; `caption` names it.
