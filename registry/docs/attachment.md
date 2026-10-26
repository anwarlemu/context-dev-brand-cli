---
name: attachment
title: Attachment
type: ui
surface: both
description: "A file on a card: its glyph in a tile frame, its name, its size or status in mono, and row actions."
use_for: "Use for files a person attaches (a sitemap to crawl, a CSV of URLs for a batch, a brand kit) or files a job produced. Set state idle (waiting, dashed), uploading or processing (name dimmed, add a Spinner), error (soft red and a red line) or done. AttachmentTrigger makes the whole card open the file; AttachmentGroup scrolls a row of them."
never: [A progress bar inside the card, Bold file names, A card that grows on hover]
source: "Extrapolated from context-dashboard c0ddf7a src/components/dots/glyph-tile.tsx and src/components/playground/code-card.tsx (cards)"
---
