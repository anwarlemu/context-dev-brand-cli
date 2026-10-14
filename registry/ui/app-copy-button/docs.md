---
name: app-copy-button
type: ui
surface: product
version: 1.0.0
use_for: Copying a value (an API key, a code sample, a command) with one click. useCopy for a copy action with its own label.
never:
  - A toast to confirm a copy; the icon turns into a green check in place
  - Showing the check when the clipboard write failed
  - A copy button without the value's name in its label ("Copy API key", not "Copy")
  - Selecting the text for the user as the copy mechanism
props: value, label? (default "Copy"), className?. useCopy() returns { hasCopied, copy(text) }
states: [default, hover, copied, focus]
dependencies: [cx, app-tooltip]
npm: [lucide-react@^1.51.0]
example: app-copy-button.example.tsx
---

A 28px ghost icon button with a top tooltip, made to sit inside fields and code cards.

States:
- default: Copy icon (`size-3.5`, strokeWidth 1.5) in `text-fg-subtle`.
- hover: `bg-wash/5` and `text-fg`, 150ms color transition.
- copied: for 1500ms after a successful write, a Check icon (strokeWidth 1.75) in `text-success`, and
  the tooltip and aria-label read "Copied". Copying again restarts the 1500ms.
- focus: the brand glass ring.

For a labeled copy button (the quickstart's "Copy"), call `useCopy` and swap the label to "Copied"
on an app-button.
