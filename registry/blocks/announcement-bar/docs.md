---
name: announcement-bar
type: block
version: 1.1.0
use_for: One line above the nav announcing one new API or feature, with a link.
never:
  - More than one announcement
  - Dismiss buttons, countdowns or marketing modals
  - Announcement text over 12 words
props: text, linkLabel, href
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, announcement-dot-strip]
example: announcement-bar.example.tsx
---

A thin blue bar with one sentence and one link, over the animated dot strip. Start the text with "New:" (voice.md). Remove the
slot when there is nothing new; never keep a stale announcement.
