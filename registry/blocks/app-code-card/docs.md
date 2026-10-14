---
name: app-code-card
type: block
surface: product
version: 1.0.0
use_for: Code a user copies into their app or agent (the playground call, a form's API equivalent). Code on the card, copy in the corner, one quiet footer for language, fold and agents.
never:
  - Horizontal scroll; lines wrap so the whole call stays in view
  - A dark code window or a gray code box inside the product card; code sits straight on the card
  - Language tabs; the language is a chip menu in the footer
  - A Copy button with a label in the header; copy is the icon in the code's corner
props: snippets (language label to code), foldLines? (5), agents? [string], className?
states: [folded, expanded, copied, single-language]
dependencies: [app-block, app-copy-button, app-menu, app-tooltip, cx]
npm: [lucide-react@^1.51.0]
example: app-code-card.example.tsx
---

Code is `font-mono text-caption` at a relaxed leading, 20px in from the left, wrapping anywhere.
Colors: strings `text-accent`, flags and keywords `text-navy-60`, numbers and booleans
`text-blue-70`, everything else `text-fg`.

- folded: code longer than `foldLines` shows five lines under a 48px fade to the surface, and the
  footer offers "Show all 18 lines"; its chevron turns 180 degrees over 200ms ease-emphasized.
- expanded: the full code and "Show less".
- copied: the corner button turns to a check in `text-success` for 1500ms. Press scales to 0.97.
- single-language: the footer names the language instead of the chip menu.
Footer: 44px tall over a hairline, the language chip menu (opens up), the fold toggle, and "Open in"
with one 24px mark per agent that copies the code ("Copied, paste it into Cursor").
The card does not clip, so the language menu can open over the content around it.
