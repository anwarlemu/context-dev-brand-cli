---
name: app-settings-section
type: block
surface: product
version: 1.0.0
use_for: One titled group on a settings page (auto-join, data retention, SSO, the Danger zone). A small label over a white card of rows, each a sentence and one control.
never:
  - A destructive action that fires on click; it opens a dialog confirmed by a 1500ms hold
  - Deleting an account or organization on the spot; it is scheduled with a grace period and can be cancelled
  - A heading per row in bold, or boxes inside the card; rows are divided by hairlines
  - More than one control in a row
props: title, variant?, rows [{ title?, description, lead?, muted?, action? { label, variant? (outline | outline-brand | brand), href?, disabled? }, toggle? { on? }, confirm? { title, body, holdLabel, keepLabel?, scheduled } }], onChange?(rowIndex, value). Also exports AppSettingsForm { fields [{ label, name, value, readOnly?, type?, help? }] }
variants: [default, danger]
states: [default, toggled, upsell, confirming, scheduled]
dependencies: [app-block, app-button, app-dialog, app-field, app-hold-button, app-switch, cx]
example: app-settings-section.example.tsx
---

The label is `text-body-sm text-fg-subtle`, 4px in, 8px above a card (`shadow-card`, 20px sides).
Rows are 16px tall in padding, the text at left (optional title over a muted description) and the
control at right; on phones the control drops under the text.

- default: an outline sm button, a link, or a switch. `lead` puts a status in fg before the
  description ("Not enabled."). upsell: `muted` dims the row; pair it with an outline-brand
  "Upgrade" row.
- danger: the action is a filled danger button (36px, `bg-danger`, white label). confirming: it
  opens app-dialog with the description, the body, a ghost keep button and app-hold-button.
  scheduled: the row reads "Deletion scheduled." in danger plus `scheduled`, with "Cancel deletion".
AppSettingsForm is the Personal tab's card: labeled 40px inputs, 20px apart, read-only ones muted.
