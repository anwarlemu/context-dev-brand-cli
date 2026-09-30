---
name: section-heading
type: ui
version: 1.0.0
use_for: The heading of every section. Headline with the key phrase in blue, one line of muted sub, optional action on the right.
never:
  - Bold or a heavier weight for emphasis; emphasis is the blue highlight
  - Eyebrow text above the headline
  - More than one highlight
  - A sub longer than 24 words
props: title, highlight? (a phrase inside title), sub?, align? (left | center), level? (h1 | h2), size? (display | h1 | h2), action?, tone? (default | on-brand | inverse)
variants: []
copy_rules: voice.md#mechanics
dependencies: [cx]
example: section-heading.example.tsx
---

`title` is the whole headline, 12 words max. `highlight` is the phrase inside it that carries the
claim ("access to the web", "at any scale"); it renders in blue. Put the action, if any, on the right as an
outline Button. Use `level="h1"` only in a hero.
