---
name: badge
title: Badge
type: ui
surface: both
description: "Status labels, product tags, and site chips."
kinds: [app-badge, chip]
use_for: "A run's or monitor's status (`default` for paused or queued, `brand` running, `success`, `warning` skipped, `destructive` failed), `tag` for a tag, `chip` for the site's pill-shaped labels."
never: [Badges as buttons, More than one tone per row]
source: context-dashboard c0ddf7a src/components/monitors/monitor-status.tsx; src/components/ui/form.tsx; website src/components/sections/home/product-grid.tsx (chip)
---
