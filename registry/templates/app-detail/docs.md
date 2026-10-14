---
name: app-detail
type: template
surface: product
version: 1.0.0
route: /(dashboard)/batches/[id]
use_for: One record's page (a batch, a monitor run, a request). Breadcrumb back to the list, then the record's status and its sections.
structure:
  slots:
    header: { allowed: [app-page-header], default: app-page-header, required: true, max: 1 }
    content: { allowed: [app-detail-card], default: app-detail-card, required: true, max: 1 }
  forbidden: [carousel]
never:
  - A centered hero title on a detail page; the breadcrumb heads it
  - Facts in a table; facts are a gray detail list of label and value rows
  - Destructive actions as buttons; they live in the card's action menu, held 1500ms
dependencies: []
---

The header uses the `breadcrumb` variant (parent list, chevron, the record's mono id). One card
holds the status head and sections 24px apart. A record that no longer exists shows "This batch
doesn't exist anymore." with an outline "Back to batches" button instead of the card.
