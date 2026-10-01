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
variants: [actions, answer, assets, autofill, batch, brand-kit, collect, components, context, crawl, design-system, discover, enrich, extract, freshness, generate, identity, metadata, monitor-ways, output, parse, question, rag, research, scope, scrape, search, setup, site-map, sources, spacing, structure, tenant-theme, type, url-list, watch]
dependencies: [dot-engine, cx]
export: DotScene
example: dot-story.example.tsx
---

Plays only while on screen, downloads its code on first view, and shows the static resting picture
with reduced motion. Colors come from tokens at runtime. Pick the scene that matches the card:

| Scene | Shows |
|---|---|
| `actions` | * The Read dynamic pages |
| `answer` | * The Research |
| `assets` | * The Get the visual assets |
| `autofill` | * The Autofill onboarding forms |
| `batch` | * The Run batches at scale |
| `brand-kit` | * The Brand kit page |
| `collect` | * The Collect the dataset |
| `components` | * The Component details |
| `context` | * The Add company context |
| `crawl` | * The Full-site collection |
| `design-system` | * The Style guide page |
| `discover` | * The Discover page URLs |
| `enrich` | * The Enrich any entity your agent sees |
| `extract` | * The Extract |
| `freshness` | * The Control freshness |
| `generate` | * The Generative AI page |
| `identity` | * The Resolve an identity |
| `metadata` | * The Use available metadata |
| `monitor-ways` | A page monitor |
| `output` | * The Choose your output |
| `parse` | * The Parse File |
| `question` | * The Start with a question |
| `rag` | * The Ground RAG in fresh content |
| `research` | * The Run deep research on demand |
| `scope` | * The Scope the discovery |
| `scrape` | * The Scrape anything |
| `search` | * The Search |
| `setup` | * The Do it yourself's three steps as one looping picture |
| `site-map` | * The Map page |
| `sources` | * The Keep the sources |
| `spacing` | * The Spacing and depth |
| `structure` | * The Choose the structure |
| `tenant-theme` | * The theming page |
| `type` | * The Colors and typography |
| `url-list` | * The Massive URL lists |
| `watch` | * The Monitor |
