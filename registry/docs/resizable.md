---
name: resizable
title: Resizable
type: ui
surface: both
description: "Panels with a draggable light line between them, turning blue while dragged or focused, with an optional small grip tab."
use_for: "Let people trade space between two views they use together: the playground's parameters and its result, a list and its detail. Give panels sensible minimum sizes, and add withHandle when the edge is not otherwise obvious. Arrow keys resize from the keyboard."
never: [More than three panels in a row, Panels so small their content breaks, Resizing as the only way to reach content]
source: "context-dashboard c0ddf7a src/components/playground/results.tsx (the light dividers between panes)"
---
