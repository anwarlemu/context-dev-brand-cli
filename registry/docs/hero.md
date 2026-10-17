---
name: hero
title: Hero
type: site
surface: site
description: "Site hero with white or blue backgrounds, title, description, actions, and an optional media panel."
kinds: [hero, hero-title, hero-subtitle, eyebrow]
use_for: The first section of a site page, once. `size="large"` and `surface="white"` for the home page; the default title and `surface="blue"` for inner pages. One `pill` and one `pill-outline` button as `actions` (`pill-on-brand` on blue), the first in a `HeroAction` with its "No card required" note; the visual in `HeroMedia`, a `HeroFrame` or dot field as `background`.
never: [Bold titles, More than one accent phrase group, Left aligned hero text, A gray or gradient hero background, A second colored block beside the visual panel]
source: src/components/sections/shared/hero.tsx; src/components/sections/home/homepage-hero.tsx; src/components/sections/shared/hero-frame.tsx; src/components/sections/shared/demo-footer-tab.tsx; src/components/sections/shared/brand-outline-pill.ts
---
