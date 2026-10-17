---
name: badge
title: Badge
type: ui
surface: both
description: The product's status label (the word in mono, colored by status) and tag chip, and the site's hairline chip.
kinds: [app-badge, chip]
use_for: "A run's or monitor's status (`default` for paused or queued, `brand` running, `success`, `warning` skipped, `destructive` failed), `tag` for a tag, `chip` for the site's pill-shaped labels."
never: [Badges as buttons, More than one tone per row]
source: src/app/(dashboard)/o/[org_id]/(main)/monitors/components/StatusBadge.tsx; src/components/dashboard-ui/tag-filter.tsx (tag); src/components/sections/home/product-grid.tsx (chip)
---
