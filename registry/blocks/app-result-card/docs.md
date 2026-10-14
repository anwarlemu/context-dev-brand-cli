---
name: app-result-card
type: block
surface: product
version: 1.0.0
use_for: What a playground call returned. A tabs row above the card with the response status, and the card's states from ready to result.
never:
  - A made-up result before the first run; the ready state invites a call instead
  - An "OK" badge on success; only failures flag themselves
  - A spinner alone while running; say what is being called
  - Tabs or controls inside the card; the card holds nothing but the result
props: state (ready | running | result | error), actionLabel, cost, endpoint, examples?, result? { status, formats, credits, time, source, preview?, json }, error? { status, message }, history? [{ input, status, duration, time }], onRun?(input?)
states: [ready, running, result, error, history-empty]
dependencies: [app-block, app-tabs, app-composer, cx]
npm: [lucide-react@^1.51.0]
example: app-result-card.example.tsx
---

The tabs row (32px) sits above the card: Result | History before a run, Preview | JSON | History
after. At its right, the status: a dot and "200 OK" (2xx success, 4xx alert-strong, 5xx danger).
Switching tabs fades the card's content in over 150ms, in step with the gliding pill.

- ready: `text-h5` "Ready to scrape", one line on what will show, "Try a.com, b.com, or c.com"
  as accent links that run that input, and the run button with its cost again.
- running: five 8px brand dots pulsing 120ms apart, and "Calling /v1/scrape" in mono.
- result: a stats strip (Formats, Credits, Time, then the key or "Run in the playground"), and
  the response below: Preview as text, JSON in mono, both wrapping, never scrolling sideways.
- error: a 40px danger icon box, "The call failed with 402", and the message.
- history-empty: "No calls yet" and one sentence. A history row is 44px: dot, mono input, code,
  duration, time.
