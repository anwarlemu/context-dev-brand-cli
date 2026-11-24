---
name: legal-page
title: Legal page
type: site
surface: site
description: "Legal page with a back link, title, last updated date, and a styled prose body with an on this page list."
kinds: [page, body-text, link]
use_for: Privacy policies, terms and data processing pages. Put the text in as children (sections with an `h2` each, `h3` and `h4` inside, paragraphs, lists, `strong` lead-ins and links); the page styles them and builds the "On this page" list (from lg) from the `h2`s, marking the section being read and scrolling to one when clicked. Set `--header-offset` to the sticky header's height. LegalPageBody is the text and list alone.
never: [Bold headings or bold lead-ins, A centered title, The site's full policy text in examples, A dark or gray page background]
source: src/app/(marketing)/privacy/page.tsx; src/components/legal/legal-page.tsx; src/components/legal/legal-page-body.tsx
---

The list scrolls on its own when it is taller than the window and fades at its edges (`fade-y`). A click scrolls
smoothly to the section, or jumps under reduced motion.
