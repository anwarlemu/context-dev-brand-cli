---
name: table
title: Table
type: ui
surface: product
description: "Data table with headers, row separators, and tabular numbers."
kinds: [app-table, app-th, app-td]
use_for: Lists of records.
never: [Vertical rules, Uppercase headers]
source: context-dashboard c0ddf7a src/components/api-keys/api-keys-page.tsx; src/components/team/team-page.tsx
---

A wide table scrolls sideways inside the card with `fade-x`, so columns fade at the edges instead of being cut off.
