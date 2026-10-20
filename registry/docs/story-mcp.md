---
name: story-mcp
title: MCP story
type: visual
surface: site
description: "Dot animation of an assistant plugging into the hosted MCP server and answering from the web."
kinds: []
use_for: "Giving an AI assistant web search through MCP, on a workflow card (the Search page shows it beside RAG). Plays only on screen; shows its resting picture with reduced motion."
never: [Stories as the main content of a page]
source: site src/components/sections/products/mcp-story.tsx; src/components/sections/products/mcp-story-player.ts; src/components/sections/products/mcp-story-scenes.ts
files: [components/visuals/stories/mcp-story.tsx, components/visuals/stories/mcp-story-player.ts, components/visuals/stories/mcp-story-scenes.ts]
---

An assistant window plugs into a globe through a connector labeled MCP, the prompt "search the web" is typed and sent, a pulse runs along the cable and back, and the reply lines fill in. The labels under the globe name the server and that sign-in uses OAuth.
