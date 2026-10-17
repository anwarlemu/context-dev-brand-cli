---
name: site-footer
title: Site footer
type: site
surface: site
description: The site's near-black footer. The brand block (logo, two-line description, socials and a "Backed by" line) and the compliance badges over a row of inline links sit over a white rule; the link groups run in four columns; the copyright row sits between two rules with nodes on the crossings; and a watermark band with its button closes it.
kinds: [footer]
use_for: The foot of every site page, once. Pass `badges` (the SOC 2 images) and `asideLinks` (`FooterInlineLink`, `FooterStatusLink` with the service's state), the link groups, the legal links, and the `watermark` (`FooterWatermark`) with a `FooterCopyButton` as its `watermarkAction`.
never: [A gray or blue footer, Bold link text, More than four link columns, The watermark band without the dark footer above it]
source: src/components/sections/shared/footer.tsx; src/components/sections/shared/footer-service-status-link.tsx; src/components/sections/shared/footer-copy-prompt-button.tsx; src/components/sections/shared/section-grid-lines.tsx
---

The column's lines continue down the footer in the dark tone. The watermark band is a field of faint white dots,
brightest in the middle, under the wordmark; the button sits on the wordmark's "e" crossbar (in its own band above it on
phones) and is the watermark's cursor origin, so the watermark's dotted cursor clicks it before gliding onto the letters.

`FooterCopyButton` copies its `text` and swaps its label for "Copied" for two seconds, keeping its width. The status
dot holds a neutral gray until the state is known.
