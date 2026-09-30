---
name: faq
type: block
version: 1.1.0
use_for: Questions that remove doubt before sign-up. Heading and one action on the left, questions on the right.
never:
  - More than 8 questions per topic or more than 4 topics
  - Answers over 60 words; link to the docs instead
  - Marketing claims dressed as questions
props: title, highlight?, sub?, action? { label, href }, topics ({ id, label, items ({ question, answer }[]) }[]), demo? (default true)
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, button, tabs, accordion, dot-story, dot-engine]
example: faq.example.tsx
---

With one topic the questions show directly; with two or more they sit under topic tabs. Answers
are plain text with facts and numbers. Under the heading, an animated banner asks for questions and
flies off as a paper plane; `demo={false}` removes it. Questions are the ones people actually ask sales and support.
