---
name: use-case-how-it-works
title: Use case how it works
type: site
surface: site
description: "Numbered implementation steps with install commands and code examples."
kinds: [card, card-ring, code-window, tabs]
use_for: The "how it works" section of a use case or product page. `UseCaseHowItWorks` keeps the install command and the code on one language; `UseCaseStepCards` for three or four steps that each carry an example, with outline pills to the APIs under them. `UseCaseCodeTabs` is the tabbed code window on its own (`label`, `actions`, `showInstall` for the install footer); `UseCaseSectionLinks` closes a section with outline pills (the site uses it under the steps and, as "Guides for this workflow", under the demo). Every code window and install command on a page follows one remembered language (useCodeLanguage).
never: [Full syntax themes in the code (Context.dev's light highlighting only), More than four step cards in a row, Steps without numbers, An arrow that moves on hover in the section links, A language picker that only changes one window on the page]
source: src/components/sections/use-cases/use-case-sections.tsx; src/components/sections/use-cases/use-case-code-tabs.tsx; src/components/sections/usecases/use-case-landing-page.tsx; src/components/sections/products/code-language-store.ts
---
