---
name: careers-page
title: Careers page
type: site
surface: site
description: "Careers page: the white hero, then open roles grouped by team as ringed cards with chips and an apply pill."
kinds: [hero, section, section-heading, card-ring, chip, button-secondary]
use_for: A careers or jobs page. `title`, `accent`, `description` and `actions` go to the hero (link a pill to `#roles`); `roles` (title, team, location, type, description, href) are grouped by team in the order given, two cards a row from md. `emptyMessage` shows when there are none; `note` is a line under the roles (an open application).
never: [Salary tables, Photos of people in examples, Moving cards or arrows on hover, A blue hero for this page]
derived_from: [hero, section, product-grid, badge, button]
---

Derived, not ported: the brand's site has no careers page. It is composed from library items only: Hero (white), a
SiteSection with SectionHeading and SectionHeaderRule, and role cards drawn like the product grid's cards (a white card
in the soft blue ring, the title beside an outline pill, Badge chips for location and type).
