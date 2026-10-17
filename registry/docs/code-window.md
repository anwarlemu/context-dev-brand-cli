---
name: code-window
title: Code window
type: site
surface: site
description: "Site code and terminal windows, language tabs, copy controls, and install commands."
kinds: [code-window]
use_for: Every code sample on the site. `CodeWindow` for one snippet, `CodeTabs` for the same call in several languages, `TerminalWindow` where a ring is already drawn around it, `InstallCommand` beside a `CodeTabs` for the picked language's package.
never: [Full syntax themes (one accent for strings and numbers), Light code blocks on the site, A second ring around a CodeWindow]
source: src/components/sections/shared/code-frame.tsx; src/components/sections/use-cases/use-case-code-tabs.tsx; src/components/sections/shared/terminal-code-theme.ts
---
