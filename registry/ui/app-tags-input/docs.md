---
name: app-tags-input
type: ui
surface: product
version: 1.0.0
use_for: A field for a list of short values (domains, URLs, CSS selectors, emails) entered as removable tags.
never:
  - A textarea with one value per line where values are short and discrete; use tags
  - Silently dropping an invalid value; keep it as a red tag so it can be fixed
  - Duplicate tags; a value already in the list is not added again
  - Tag colors other than blue (valid) and red (invalid)
props: id, tags, onChange(tags), placeholder, isTagInvalid?(tag), bare?
variants: [default, bare]
states: [empty, hover, focus, filled, invalid-tag]
dependencies: [cx]
npm: [lucide-react@^1.51.0]
example: app-tags-input.example.tsx
---

- `default`: draws the field (min 40px, `border-line`, `rounded-control`).
- `bare`: no border, for a tags input inside a container that draws one (a parameters row).

Input: comma or Enter commits the draft; blur commits it; a pasted list split on commas or spaces adds
every new value at once; Backspace in an empty draft removes the last tag.

States:
- empty: shows the placeholder. hover: `border-line-strong`. focus: `focus-within:border-brand`, 150ms.
- filled: 24px tags, `rounded-control-sm`, `text-caption`, `bg-blue-10 text-accent`. Each has a 16px
  remove button that fills brand on hover.
- invalid-tag: `isTagInvalid` returning true draws that tag `bg-danger/8 text-danger`.
