---
name: hero-dot-field
type: ui
version: 1.0.0
use_for: "The hero dot field: a live pattern with the logo cut from it, and optional stat morphs."
never:
  - Behind body text without the hole attribute
  - On more than one section per page
props: "className?, words?, wordClassName?, fine?, lively?, logoMark?"
variants: []
dependencies: [dot-engine, cx]
example: hero-dot-field.example.tsx
---

Mark the content it must avoid with the hero pattern hole attribute. `HeroStatMorphs` adds the four
floating stats on wide screens.
