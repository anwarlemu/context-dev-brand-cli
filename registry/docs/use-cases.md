---
name: use-cases
title: Use cases explorer
type: site
surface: site
description: The home page's tabbed code explorer in the soft blue ring (not the use case pages' sections, which are the use-case items), the use cases listed on the left with a pale brand-tint card gliding to the picked one, the code for each in a code window; it steps through them every six seconds while on screen, with a countdown donut.
kinds: [tabs, code-window, card-ring]
use_for: Showing what the API does through short code samples, four to eight of them. `UseCaseTryIn` groups the open-in-an-agent buttons in the window's chrome bar; `backdrop` takes the ring pattern behind the window.
never: [Pill tabs here (the list is the brand's tinted sidebar), Code that changes the card's height between tabs]
source: src/components/sections/home/use-cases.tsx; src/components/feature-selector.tsx; src/components/sections/home/use-tab-glide.ts
---
