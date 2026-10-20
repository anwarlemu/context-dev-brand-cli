---
name: use-code-language
title: useCodeLanguage
type: hook
surface: site
description: "One remembered code language shared by every code sample on the page."
kinds: []
use_for: Code tabs, install commands and code explorers that should all switch together when the visitor picks a language (UseCaseCodeTabs, UseCaseInstallCommand, UseCases and ProductCodeExplorer use it). The pick is kept in storage where allowed and followed across tabs.
never: [A per-window language state on a page with more than one code sample, Reading storage during render on the server (the hook returns null there)]
source: src/components/sections/products/code-language-store.ts
---
