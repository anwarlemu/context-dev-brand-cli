---
name: aspect-ratio
title: Aspect Ratio
type: ui
surface: both
description: "Holds media at a fixed shape; round and frame the media inside with the card's corners and hairline."
use_for: "Keep screenshots, video and logo previews from shifting the layout while they load (16 / 9 for a page capture, 1 / 1 for a logo). Put the image inside with object-cover and the card's corners."
never: [Stretching a logo to fill, A frame without the media's real ratio]
source: "No dashboard counterpart: it keeps media placeholders at their shape as context-dashboard c0ddf7a src/components/ui/skeleton.tsx does, framed as the brand frames screenshots"
---
