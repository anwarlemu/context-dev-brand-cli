---
name: section
title: Section
type: site
surface: site
description: "Site section layout with column rules, a heading, and an optional divider."
kinds: [section, section-heading, section-description]
use_for: Every site section after the hero. `SectionHeading` opens it, `SectionHeaderRule` divides the heading from the content, `lines` draws the column's edges where the base layer does not (a dark band).
never: [Centered section headings, Bold headings, Gray section backgrounds, Shadows or colored bands between sections]
source: src/components/sections/shared/section-grid-lines.tsx; src/components/sections/home/home-design.ts; src/components/sections/shared/section-divider.tsx
---
