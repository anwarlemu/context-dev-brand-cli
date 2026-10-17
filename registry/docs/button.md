---
name: button
title: Button
type: ui
surface: both
description: The brand's buttons. Product controls (brand blue for the one main action, black, outline, ghost, destructive) and the site's pills.
kinds: [button-primary, button-secondary, button-on-brand, app-button-brand, app-button-black, app-button-outline, app-button-ghost, app-button-danger]
use_for: Every action. One `default` (brand blue) per product screen; on the site one `pill` (black) per section, `pill-outline` for the rest.
never: [Two blue main actions on one product screen, Pills inside the product, Bold labels]
source: dashboard src/components/ui/button.tsx; site src/components/sections/shared/brand-outline-pill.ts
---
