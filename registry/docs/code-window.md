---
name: code-window
title: Code window
type: site
surface: site
description: "Site code and terminal windows, language tabs, copy controls, and install commands."
kinds: [code-window]
use_for: Every code sample on the site. `CodeWindow` for one snippet, `CodeTabs` for the same call in several languages, `TerminalWindow` where a ring is already drawn around it, `InstallCommand` beside a `CodeTabs` for the picked language's package.
never: [Syntax colors other than the code tokens (text-code-*), A second ring around a CodeWindow]
source: src/components/sections/shared/code-frame.tsx; src/components/sections/use-cases/use-case-code-tabs.tsx; src/components/sections/shared/terminal-code-theme.ts; src/lib/code-syntax-theme.ts
---

Code takes the site's GitHub-dark syntax theme: keywords violet, calls green, properties and keys blue, strings pale
blue, numbers and constants orange, punctuation and comments gray, the rest near white. The site runs Shiki; `CodeBlock`
holds a small port of what Shiki gives the site's samples, so pass `language` (typescript, python, ruby, php, go, curl
or shell) when you know it; without it the language is guessed from the code. `CodeTabs` passes each sample's own.
