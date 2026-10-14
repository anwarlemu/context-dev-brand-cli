---
name: app-form
type: template
surface: product
version: 1.0.0
route: /(dashboard)/batches/new
use_for: A create or edit page (new batch, new monitor, edit monitor). Back link, centered header, then the form with its cost and submit.
structure:
  slots:
    header: { allowed: [app-page-header], default: app-page-header, required: true, max: 1 }
    form: { allowed: [app-form-panel], default: app-form-panel, required: true, max: 1 }
  forbidden: [carousel]
never:
  - Errors before the first submit attempt
  - An (optional) suffix on a label; help text ends with "Optional."
  - A submit that can fire twice; guard it until navigation finishes
  - Hiding what a run will cost; the footer states the credits it reserves
dependencies: []
---

The header uses the `back` variant ("Back" above a centered title and one sentence). The form panel
has its own mode bar (dashboard or code), fields 28px apart, an Advanced disclosure and a footer
with the cost line and the brand submit. Short dialogs (create a key, invite a teammate) are an
app-dialog on the list page instead of a form page.
