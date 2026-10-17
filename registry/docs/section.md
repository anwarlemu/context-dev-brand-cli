---
name: section
title: Section
type: site
surface: site
description: A full-bleed site band with its content in the ruled column, the column's edge lines and header rule with their nodes, and the left aligned section heading with its closing words in blue.
kinds: [section, section-heading, section-description]
use_for: Every site section after the hero. `SectionHeading` opens it, `SectionHeaderRule` divides the heading from the content, `lines` draws the column's edges where the base layer does not (a dark band).
never: [Centered section headings, Bold headings, Gray section backgrounds, Shadows or colored bands between sections]
source: src/components/sections/shared/section-grid-lines.tsx; src/components/sections/home/home-design.ts; src/components/sections/shared/section-divider.tsx
---
