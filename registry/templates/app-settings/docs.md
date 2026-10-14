---
name: app-settings
type: template
surface: product
version: 1.0.0
route: /(dashboard)/settings
use_for: Settings. Centered header with tabs (Personal, Organization, Billing), then titled sections of rows, the danger zone last.
structure:
  slots:
    header: { allowed: [app-page-header], default: app-page-header, required: true, max: 1 }
    sections: { allowed: [app-settings-section], default: app-settings-section, required: true, max: 6 }
  forbidden: [carousel]
never:
  - A danger zone above other sections; it is always last
  - Deleting an account or organization on one click; it needs a dialog and a hold, then a grace period
  - Saving each field with its own button bar; one row, one action
dependencies: []
---

Pass the tabs as the header's children so they sit centered under the sentence. Sections stack
24px apart; each is a small label over a white card of rows. Use the `danger` variant for the last
section. More sections: `scaffold app-settings --slot sections=app-settings-section+app-settings-section`.
