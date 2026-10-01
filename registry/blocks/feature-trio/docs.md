---
name: feature-trio
type: block
version: 1.2.0
use_for: Three things you control with one API, side by side, each with an animated dot scene.
never:
  - More or fewer than 3 features
  - Icons or emoji instead of a dot scene
  - Feature titles over 6 words
  - The same scene twice in one trio
props: title?, highlight?, sub?, features ({ title, text, scene (a dot-story scene name) }[], exactly 3)
variants: []
copy_rules: voice.md#mechanics
dependencies: [section, section-heading, dot-story, dot-engine]
example: feature-trio.example.tsx
---

Titles say what the builder can do, texts say how in one or two sentences. Pick scenes the product
page uses on the site: Scrape uses output, actions, freshness; Answers uses question, structure,
sources; Monitors uses site-map, freshness, batch. Run `npx context-ds docs dot-story` for the list.
