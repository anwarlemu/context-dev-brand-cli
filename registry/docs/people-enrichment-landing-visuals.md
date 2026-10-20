---
name: people-enrichment-landing-visuals
title: People enrichment page visuals
type: site
surface: site
description: "The People enrichment page's hero demo and capability panels: a work email in and a candidate profile with its match score out."
kinds: []
use_for: "The People enrichment product page (context.dev/people-enrichment): PeopleEnrichmentHeroDemo under the hero, and PeopleIdentifiersPanel, PeopleContextPanel, PeopleMatchPanel as the pictures in its three capability cards (ProductStorySection), in that order."
never: [A dot story and a panel in the same card, Bold names or titles, Syntax colors in the output]
source: src/components/sections/products/people-enrichment-landing-visuals.tsx; src/components/sections/products/product-landing-content.tsx
files: [components/site/people-enrichment-landing-visuals.tsx]
---

PeopleEnrichmentHeroDemo is a ProductDemoCard with a work email in and a candidate profile with its match score out. The panels show the identifiers a lookup starts from, the profile context, and the two match outcomes. Each takes its example values as
props where a page would change them, and keeps the site's illustrative ones by default.
