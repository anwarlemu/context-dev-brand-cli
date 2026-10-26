---
name: trace
title: Trace
type: ui
surface: both
description: "An agent's or a job's steps as quiet lines with glyphs, durations, running and failed states, and steps that open to show detail."
use_for: "Use to show what a crawl, a batch or an agent did: fetched the sitemap, found 1,240 pages, parsed 3 failed. TraceLine with TraceIcon, TraceTitle and TraceDescription per step; set status running (with a Spinner as its icon), pending or error. Wrap a step in TraceCollapsible with TraceCollapsibleTrigger and TraceCollapsibleContent to show its detail. Put a link or button around a TraceLine to make it open something."
never: [Bold step titles, A different color per step, Steps that animate in]
source: "Extrapolated from context-dashboard c0ddf7a src/components/shell/sidebar.tsx (quiet rows) and src/components/ui/skeleton.tsx"
---
