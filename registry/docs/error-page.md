---
name: error-page
title: Error page
type: site
surface: site
description: "Black 500 page with a dotted status code, title, a retry pill, a second pill, and a quiet line with the error reference."
kinds: [page, button-on-brand, link]
use_for: A server error page or an error boundary's fallback. `onRetry` is the first pill (reset the boundary, or reload) and spins while a returned promise runs; `secondaryAction` is the second pill (a `pill-on-brand` with `border-white/40`). `reference` puts the error's id in the quiet line, followed by `note`. `overlay` covers the window above the site's chrome.
never: [A stack trace or raw error message, A blue page background, More than two pills]
derived_from: [not-found-page]
---

Derived, not ported: the brand's site has no error page. This is the not found page item (not-found-page) rendered
with a 500 in its dots, a retry pill and no known paths, so the "Did you mean" line stays empty; everything it draws
comes from that item.
