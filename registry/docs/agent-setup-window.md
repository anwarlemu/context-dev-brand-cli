---
name: agent-setup-window
title: Agent setup window
type: site
surface: site
description: The home page's dark window with the ways to set an agent up (Prompt, MCP, CLI) as tabs that cycle while it is on screen, agent logos that copy the prompt, a copy button, and the prompt revealed word by word.
kinds: [code-window, tabs]
use_for: Showing how to connect an agent next to a section heading. Wrap it in the ring (`rounded-card bg-ring-tint p-2`) on white.
never: [More than four methods, Agent logos recolored to the brand blue, Toasts from the component itself (pass onCopy)]
source: src/components/sections/home/agent-setup-window.tsx; src/components/sections/shared/agent-setup-prompt.ts
---
