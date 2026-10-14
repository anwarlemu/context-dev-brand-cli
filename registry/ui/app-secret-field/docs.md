---
name: app-secret-field
type: ui
surface: product
version: 1.0.0
use_for: Showing a secret (an API key, a webhook secret) masked, with reveal and copy. SecretText for a masked value in a table cell.
never:
  - Revealing that changes the field's or the column's width; the full value truncates into the masked width
  - A secret shown in full by default
  - An input element for a secret the user cannot edit
  - Copy that needs the secret revealed first
props: "secret, visibleChars, label, className?. SecretText takes secret, masked, isRevealed, className?. maskSecret(secret, visibleChars)"
states: [masked, revealed, copied]
dependencies: [cx, app-tooltip, app-copy-button]
npm: [lucide-react@^1.51.0]
example: app-secret-field.example.tsx
---

A 36px quiet well: `bg-surface-subtle` with an inset hairline, `rounded-control`, 12px left, 4px
right. The value is `font-mono text-caption text-fg-muted`; then a reveal button and a copy button,
both 28px ghost icon buttons with top tooltips.

States:
- masked: the first `visibleChars` characters (the key's prefix) then twelve bullets.
- revealed: the full value, truncated with an ellipsis into exactly the masked text's width, so
  showing it never widens the field or the table column around it. Eye becomes EyeOff; the tooltip
  reads "Hide".
- copied: see app-copy-button (green check for 1500ms). Copy works while masked.
