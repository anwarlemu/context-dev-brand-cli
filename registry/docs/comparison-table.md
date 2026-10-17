---
name: comparison-table
title: Comparison table
type: site
surface: site
description: "Comparison table with a highlighted Context.dev column and text or check-mark cells."
kinds: [table, card-ring]
use_for: "Comparing the product with an alternative: `text` on a use-case page (your own crawler against the API), `marks` for an alternatives page's full feature comparison. Mark Context.dev's column with `highlight`."
never: [Uppercase or bold heads, Red crosses for a missing feature (an en dash), Vertical rules between columns, Gray category bands]
source: src/components/sections/use-cases/use-case-sections.tsx (UseCaseComparison); src/components/sections/alternatives/alternative-comparison-table.tsx
---

The card scrolls sideways on narrow screens and is focusable, so a keyboard can scroll it too; `caption` names it.
