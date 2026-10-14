---
name: app-form-panel
type: block
surface: product
version: 1.0.0
use_for: A create or edit form (new batch, new monitor). Mode bar, fields as data, an Advanced disclosure, and a footer that says the cost beside the brand submit.
never:
  - Errors before the first submit attempt
  - An optional marker in a label; optional fields end their help with "Optional."
  - A submit button that can fire twice while the first submit is in flight
  - Hiding what a submit spends; say it in the footer before the click
props: fields [AppFormField], advanced? [AppFormField], code?, docsHref?, cost?, submitLabel, action?, onSubmit?(values). AppFormField { type (text | textarea | number | segmented | select | switches | tags), name, label, help?, placeholder?, mono?, required? (the error text), defaultValue?, options? }
states: [pristine, invalid, submitting, code-mode, advanced-open]
dependencies: [app-block, app-button, app-field, app-menu, app-switch, app-tabs, app-tags-input, app-code-card, cx]
npm: [lucide-react@^1.51.0]
example: app-form-panel.example.tsx
---

- Mode bar (only with `code`): app-tabs "Create in the dashboard" | "Create with code" and a
  quiet docs link, over a hairline, 12px above it. code-mode shows the call in app-code-card.
- Fields stack 28px apart, each a label, the control (40px fields, 8px corners) and one line of
  help. A segmented field's help follows the selected option. Switches sit in one bordered list.
- invalid: after the first submit attempt, a field with `required` and no value shows the error
  in `text-danger` in place of its help and gets the danger border. Nothing shows before that.
- advanced-open: the chevron rotates 90 degrees over 200ms ease-out; fields in two columns.
- submitting: a second submit is ignored until the first finishes.
- Footer: a hairline, 24px above; the cost line in `text-fg-muted` at left, brand md submit with an
  arrow at right. Posts to `action` by default, or hands values to `onSubmit`.
Put the back link and centered title in the page header above the form.
