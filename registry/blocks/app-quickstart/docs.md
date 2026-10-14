---
name: app-quickstart
type: block
surface: product
version: 1.0.0
use_for: The overview's quickstart card. Numbered steps from signing up to a first call. Copy the key, set up an agent with one snippet, paste one prompt.
never:
  - More than four steps, or steps without a number box
  - Snippets that change the card's height when switching tabs; they share one grid cell
  - Showing the real key in a snippet or prompt by default; it is masked and copied in full
  - A second filled button; the prompt's Copy is the card's only one
props: "apiKey { name, secret } | null, manageHref, snippets [{ value, label, code }], prompts [{ value, label, text }], riseIndex?"
states: [default, revealed, copied, no-key, scrolling]
copy_rules: voice.md#mechanics
dependencies: [cx, app-block, app-button, app-copy-button, app-scroll-area, app-secret-field, app-tabs, app-tooltip]
npm: [lucide-react@^1.51.0]
example: app-quickstart.example.tsx
---

A card (`p-3`) with a 28px icon box, "Quickstart" and a "Manage keys" arrow link. Steps are 16px
apart, each with a 20px number box. `{{key}}` in snippets and prompts is shown masked, copied real.

- revealed: the key shows in full in the same width (SecretText); Eye and EyeOff toggle it.
- copied: copy pills swap icon and word in place over 200ms (Copy to Copied, success color) and
  hold for 1500ms. The prompt's Copy is filled black (`primary`).
- Snippet tabs: the shown one fades and rises 4px in over 300ms, the old one out over 150ms.
- no-key: a dashed note, "Every key is disabled. Create or enable one to get started."
- scrolling: steps scroll inside the card with edge fades (app-scroll-area) on short windows.
