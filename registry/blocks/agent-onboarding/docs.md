---
name: agent-onboarding
type: block
version: 1.1.0
use_for: The two ways to start, side by side. Do it yourself (white card), or let your agent do it (blue card, recommended).
never:
  - The agent path as the secondary card; it is the blue, recommended one
  - A setup prompt that does not work when pasted
  - More than 4 manual steps
props: title, highlight?, sub?, manual { title, steps (max 4), cta { label, href } }, agent { title, body, prompt, cta { label, href } }
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, card, button, badge, code-window, dot-story, dot-engine, blog-cover, ring-backdrop]
example: agent-onboarding.example.tsx
---

The agent card carries the exact one-line prompt a developer pastes into Claude Code or Codex.
Test the prompt before shipping: it is a product surface, not decoration.
