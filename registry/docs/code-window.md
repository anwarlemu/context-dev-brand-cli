---
name: code-window
title: Code window
type: site
surface: site
description: The site's near-black terminal window in the soft blue ring, with window dots, a label chip, actions, and a tabbed variant for languages.
kinds: [code-window]
use_for: Every code sample on the site. `CodeWindow` for one snippet, `CodeTabs` for the same call in several languages, `TerminalWindow` where a ring is already drawn around it.
never: [Full syntax themes (one accent for strings and numbers), Light code blocks on the site, A second ring around a CodeWindow]
source: site src/components/sections/shared/code-frame.tsx; src/components/sections/use-cases/use-case-code-tabs.tsx
---
