---
name: sidebar-alert-card
title: Sidebar alert card
type: product
surface: product
description: "Sidebar plan and billing notice: danger, warning or neutral, with a corrective action."
kinds: []
use_for: "Above Help: a failed payment or running out of credits (danger), a plan that is ending or credits running low (warning, with `remainingCredits`), the free plan's subscribe prompt (neutral)."
never: [Using it for news or upsells, A moving icon, A pulsing dot]
source: src/components/sidebar-status-card.tsx; src/components/sidebar-payment-failed-card.tsx; src/components/sidebar-cancelling-card.tsx; src/components/sidebar-upgrade-card.tsx; src/styles/dashboard-system.css
---

The tones are the dashboard's status card: a soft fill, a pale edge that deepens on hover, the title in the strong
tone color with a still dot (danger and warning only). Neutral is a gray card with the action in brand blue. While the
action runs (`pending`), the card is busy, the words fade back and the icon goes. Credits left show as a plain figure;
the dashboard rolls its digits, which needs a motion library this card does not take on.
