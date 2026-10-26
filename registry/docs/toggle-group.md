---
name: toggle-group
title: Toggle Group
type: ui
surface: both
description: "Toggles joined on the segmented control's gray track, the pressed ones as white keys; an outline variant joins outline keys."
use_for: "Choose one (type=\"single\") or several (type=\"multiple\") view options that belong together (text alignment, which APIs a chart shows, a request's formats). For a form value with one answer, SegmentedControl's gliding pill is the closer match."
never: [Mixing icon-only and labelled items without aria-labels, More than six items, A blue pressed item]
source: "context-dashboard c0ddf7a src/components/ui/form.tsx (SegmentedControl, segmented); extended to several pressed items"
---
