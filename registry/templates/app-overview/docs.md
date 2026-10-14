---
name: app-overview
type: template
surface: product
version: 1.0.0
route: /(dashboard)/overview
use_for: The dashboard home. Try an API, see usage over time, get started, and read the credit figures at a glance.
structure:
  slots:
    header: { allowed: [app-page-header], default: app-page-header, required: true, max: 1 }
    lead: { allowed: [app-composer], default: app-composer, required: false, max: 1 }
    chart: { allowed: [app-chart-card], default: app-chart-card, required: true, max: 1 }
    aside: { allowed: [app-quickstart], default: app-quickstart, required: false, max: 1 }
    stats: { allowed: [app-stat-cards], default: app-stat-cards, required: true, max: 1 }
  forbidden: [carousel]
never:
  - More than one chart on the overview; one readable chart beats four small ones
  - Cards that grow to fill a tall window; nothing stretches past its natural height
  - A page-wide entrance on every visit; cards rise on the first visit only
  - Doto for the stat figures; they are Rethink Sans with tabular numbers
dependencies: [cx]
---

Centered header, then the lead (a request bar handing off to the playground) with a wider 24px gap
under it so it reads as the page's lead, then a two-column grid at container width 4xl: the usage
chart over the stat cards on the left, the quickstart on the right spanning both rows. Cards sit
12px apart. On the first visit the cards rise 50ms apart (400ms, 8px, ease-emphasized); after
1200ms the page is marked `data-entered` and later cards simply appear. Reduced motion keeps the
fade only.
