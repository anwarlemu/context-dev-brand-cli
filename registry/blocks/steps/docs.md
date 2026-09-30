---
name: steps
type: block
version: 1.1.0
use_for: Three numbered steps from sign-up to a working feature, with the heading and one action on the left.
never:
  - More or fewer than 3 steps
  - Icons instead of the dot numbers
  - Steps that are not in the order a person does them
props: title, highlight?, sub?, action? { label, href }, steps ({ number, word, title, text }[], exactly 3)
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, button, credits-dot-number]
example: steps.example.tsx
---

Each number is drawn in dots and morphs into a short word (01 to API, 02 to SDK, 03 to URL), as on
the homepage. `word` is 3 letters or fewer. Step titles start with a verb. The action is an outline
button; the page's filled primary lives in the hero.
