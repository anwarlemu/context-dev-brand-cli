---
name: sheet
title: Sheet
type: ui
surface: product
description: "Floating side panel for record details, without a background scrim."
kinds: []
use_for: Detail panels next to a list (a monitor, a batch).
never: [Sheets for primary navigation]
source: context-dashboard c0ddf7a src/components/monitors/monitor-panel.tsx
---

Sheets are non-modal by default: the list stays clickable, and selecting another record can update the open panel. Control `open` and `onOpenChange` from the selected record. `SheetContent` stays within a `Surface` when one is present. Use `SheetClose` or Escape to dismiss it.
