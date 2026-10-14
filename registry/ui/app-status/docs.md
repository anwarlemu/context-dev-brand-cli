---
name: app-status
type: ui
surface: product
version: 1.0.0
use_for: The state of a job, monitor, key or request. AppStatus draws it as a dot, a mono label, a code pill or a haloed dot; AppSpinner and AppProgressBar show work under way.
never:
  - Colored badge pills with a fill; status is a dot or colored text, never a filled chip
  - Red for anything but a failure; client errors (4xx) are the soft alert, server errors (5xx) the strong one
  - A spinner for a page that is loading; that is a skeleton
  - Letter spacing on the mono label; tracking stays 0
props: AppStatus variant?, appearance? (dot | label | boxed | code | halo), children, className?. AppSpinner className?. AppProgressBar done, failed?, total
variants: [success, running, neutral, warning, danger]
states: [static, running]
dependencies: [cx]
npm: [lucide-react@^1.51.0]
example: app-status.example.tsx
---

Map domain states to tones, and keep the map the same on every page:

| Tone | Text, dot | Use for |
|---|---|---|
| `success` | success, success | Key active, monitor active, batch completed, 2xx |
| `running` | accent, brand | Batch running (add AppSpinner beside the count) |
| `neutral` | fg-subtle, neutral-30 | Queued, canceled, paused, key disabled |
| `warning` | warning, alert | 4xx client errors, rate limited, usage near the limit |
| `danger` | danger, alert-strong | 5xx server errors, failed pages, failed jobs |

Appearances: `dot` (6px dot plus label, 6px apart) in table cells. `label` is `font-mono text-micro
uppercase` beside a row's meta line. `boxed` outlines that label (`rounded-control-sm`, line border)
in a detail header. `code` is a 20px outlined pill with a dot and the code, tabular figures, in
request logs. `halo` is an 8px dot in a 24px soft ring before a monitor's name.

States: AppSpinner turns with `animate-spin` (linear, constant motion) and stops with reduced
motion. AppProgressBar is a 6px track; done (brand) then failed (alert) segments scale on transform
over 500ms linear as counts change.
