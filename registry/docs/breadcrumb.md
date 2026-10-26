---
name: breadcrumb
title: Breadcrumb
type: ui
surface: both
description: "The dashboard's breadcrumb: subtle gray links, 14px chevrons between them, and the current page in black."
use_for: "Show where a detail page sits under its list (Batches, then a batch ID) and let people step back up. Put it above the page title. Set an ID in mono, as the dashboard sets a batch's, and collapse middle levels into BreadcrumbEllipsis when the trail is long."
never: [A breadcrumb on a top-level page, Linking the current page, Separators other than the chevron]
source: "context-dashboard c0ddf7a src/components/batches/batch-detail.tsx"
---
