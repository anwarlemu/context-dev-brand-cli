---
name: site-footer
title: Site footer
type: site
surface: site
description: "Site footer with brand information, link groups, badges, copyright, and an optional watermark."
kinds: [footer]
use_for: The foot of every site page, once. Pass `badges` (the SOC 2 images) and `asideLinks` (`FooterInlineLink`, `FooterStatusLink` with the service's state), the link groups, the legal links, and the `watermark` (`FooterWatermark`) with a `FooterCopyButton` as its `watermarkAction`.
never: [A gray or blue footer, Bold link text, More than four link columns, The watermark band without the dark footer above it]
source: src/components/sections/shared/footer.tsx; src/components/sections/shared/footer-yc-backing.tsx; src/components/sections/shared/footer-service-status-link.tsx; src/components/sections/shared/footer-copy-prompt-button.tsx; src/components/sections/shared/section-grid-lines.tsx
---

The column's lines continue down the footer in the dark tone. The watermark band is solid neutral 90 under the
wordmark; the button sits on the wordmark's "e" crossbar (in its own band above it on
phones) and is the watermark's cursor origin, so the watermark's dotted cursor clicks it before gliding onto the letters.

`FooterCopyButton` copies its `text` and swaps its label for "Copied" for two seconds, keeping its width. The status
dot holds a neutral gray until the state is known, then takes the bright status colors the site uses on near black.
The footer's text is the regular weight throughout; only the link groups' titles are white.
