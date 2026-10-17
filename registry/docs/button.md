---
name: button
title: Button
type: ui
surface: both
description: "The brand's buttons. The product's controls (black primary, brand blue, outline, outline brand, ghost, on brand; sm 32px and md 40px) and the site's pills."
kinds: [button-primary, button-secondary, button-on-brand, app-button-brand, app-button-black, app-button-outline, app-button-ghost]
use_for: "Every action. In the product one `brand` (blue) per screen for the main action, `outline` (the default) for the rest, `primary` (black) to save, `ghost` for quiet actions, `on-brand` on a blue panel; `md` (40px, the default) for a form's or page's main action, `sm` (32px) in toolbars and cards. On the site one `pill` (black) per section, `pill-outline` for the rest, `pill-on-brand` on blue."
never: [Two blue main actions on one product screen, Pills inside the product, Bold labels]
source: src/components/dashboard-ui/button-class-name.ts; src/components/sections/shared/brand-outline-pill.ts
---
