---
name: announcement-bar
title: Announcement bar
type: site
surface: site
description: "A plain, light-gray linked announcement strip above the site header."
kinds: [announcement]
use_for: One short, centered message on a plain light-gray strip above the header (a launch, a referral discount). `SiteHeader` draws it from its `announcement` prop; use it alone above a header of your own.
never: [Dots or decorative patterns, Animated backgrounds, A blue or dark announcement band, More than one line of copy on desktop, A close button, Two announcement bars]
source: src/components/sections/shared/header.tsx
---

The current Context.dev announcement is text-only. Use `AnnouncementBar` directly or the `SiteHeader` announcement prop. Do not add a dot animation or another visual layer.
