---
name: accordion
type: ui
version: 1.0.0
use_for: FAQ questions and answers. Native details and summary, ringed like cards.
never:
  - Chevron or plus icons; the open state is a hollow dot turning solid
  - Answers longer than 60 words
props: items ({ question, answer }[])
variants: []
example: accordion.example.tsx
---

A closed question shows a hollow dot; open, the dot fills. That is the brand story at small scale.
