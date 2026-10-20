---
name: use-case-features
title: Use case features
type: site
surface: site
description: "Use-case feature cards, comparison tables, before-and-after panels, and the API example section."
kinds: [card, card-ring, table, code-window]
use_for: The middle of a use case page, inside a `SiteSection` under a `SectionHeading` and `SectionHeaderRule`. Cards three across when they divide by three, two otherwise, or `layout="rows"` with each story beside its text. One highlighted column in a comparison (its header in blue on white, its cells on a faint blue wash). `UseCaseApiExample` is a section of its own (no SiteSection around it) for one endpoint's request and response beside the playground and API reference pills.
never: [More than one highlighted column, Colored icon tiles other than brand blue, Bold feature titles, Tables that squeeze their columns on phones (they scroll), A tinted header cell on the highlighted column]
source: src/components/sections/usecases/use-case-landing-page.tsx; src/components/sections/use-cases/use-case-sections.tsx; src/components/sections/usecases/before-after-panels.tsx; src/components/sections/home/product-demo-panel.tsx; src/components/sections/home/story-stage.tsx
---
