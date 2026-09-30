---
name: dot-story
type: ui
version: 1.0.0
use_for: The animated dot pictures from context.dev. Each scene is a looping story drawn in the brand dot grid.
never:
  - Drawing a new animation by hand; pick a scene from the list
  - Two animated scenes side by side at full size in one card
  - Scenes on a surface other than white, unless the block handles it
props: variant (a scene name), className?
variants: [actions, answer, assets, autofill, batch, collect, components, context, crawl, design-system, discover, enrich, extract, freshness, identity, metadata, output, question, rag, research, scope, scrape, search, setup, site-map, sources, spacing, structure, type, url-list, watch]
dependencies: [dot-engine, cx]
export: DotScene
example: dot-story.example.tsx
---

Plays only while on screen, downloads its code on first view, and shows the static resting picture
with reduced motion. Colors come from tokens at runtime. Pick the scene that matches the card:

| Scene | Shows |
|---|---|
| `actions` | Read dynamic pages |
| `answer` | Research |
| `assets` | Get the visual assets |
| `autofill` | Autofill onboarding forms |
| `batch` | Run batches at scale |
| `collect` | Collect the dataset |
| `components` | Component details |
| `context` | Add company context |
| `crawl` | Full-site collection |
| `design-system` | Style guide page |
| `discover` | Discover page URLs |
| `enrich` | Enrich any entity your agent sees |
| `extract` | Extract |
| `freshness` | Control freshness |
| `identity` | Resolve an identity |
| `metadata` | Use available metadata |
| `output` | Choose your output |
| `question` | Start with a question |
| `rag` | Ground RAG in fresh content |
| `research` | Run deep research on demand |
| `scope` | Scope the discovery |
| `scrape` | Scrape anything |
| `search` | Search |
| `setup` | Do it yourself's three steps as one looping picture |
| `site-map` | Map page |
| `sources` | Keep the sources |
| `spacing` | Spacing and depth |
| `structure` | Choose the structure |
| `type` | Colors and typography |
| `url-list` | Massive URL lists |
| `watch` | Monitor |
