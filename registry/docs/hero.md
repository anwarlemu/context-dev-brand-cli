---
name: hero
title: Hero
type: site
surface: site
description: "Site hero with white or blue backgrounds, title, description, actions, and an optional media panel."
kinds: [hero, hero-title, hero-subtitle, eyebrow]
use_for: The first section of a site page, once. The home hero's `eyebrow` is a `HeroPill variant="byline"` (the funding line, its key words in a `HeroPillEmphasis`, the investor's wordmark and a still arrow). `surface="white"` matches the current public site, including product and use-case pages. `size="large"` permits the home title to stay on one line at wide widths; the default wraps. Use `surface="blue"` only when the page calls for that supported variant. One `pill` and one `pill-outline` button as `actions` (`pill-on-brand` on blue), the first in a `HeroAction` with its "No card required" note; the visual in `HeroMedia`, a `HeroFrame` or dot field as `background`.
never: [Bold titles, More than one accent phrase group, Left aligned hero text, A gray or gradient hero background, A second colored block beside the visual panel]
source: src/components/sections/shared/hero.tsx; src/components/sections/home/homepage-hero.tsx; src/components/sections/shared/hero-frame.tsx; src/components/sections/shared/demo-footer-tab.tsx; src/components/sections/shared/brand-outline-pill.ts
---

The live site uses a 2.5rem title on phones, 48px from sm, and 56px from lg, with 1.08 line height on desktop. The site root is 90% from 43.2rem up; the fixed desktop title size intentionally does not shrink with the root.

The hero shows at once, as the site does: there is no entrance, and `staggerIn` is a deprecated no-op. A `small`
`HeroMedia` is held to the product monitor's height (23rem by 64/74) from sm up, so a use case page's title sits where a
product page's does.
