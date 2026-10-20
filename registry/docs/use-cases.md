---
name: use-cases
title: Use cases explorer
type: site
surface: site
description: "Tabbed use-case selector with code examples and optional automatic progression."
kinds: [tabs, code-window, card-ring]
use_for: Showing what the API does through short code samples, four to eight of them. Each item takes `samples` (every SDK language with its install command) and shows them in the code tabs window with the install footer, on the page's remembered language. `glyph` takes a PersonaGlyph for the list (as the site draws it); `actions` can be a function of the sample showing, so a "Try in" button can carry its code. `UseCaseTryIn` groups the open-in-an-agent buttons in the window's chrome bar; The window sits on the ring pattern by default, as on the site (`pattern={false}` leaves it plain; `backdrop` puts your own picture behind it).
never: [Pill tabs here (the list is Context.dev's tinted sidebar), Code that changes the card's height between tabs, A language picker per window (the page shares one)]
source: src/components/sections/home/use-cases.tsx; src/components/feature-selector.tsx; src/components/sections/use-cases/use-case-code-tabs.tsx; src/components/sections/home/use-tab-glide.ts
---
