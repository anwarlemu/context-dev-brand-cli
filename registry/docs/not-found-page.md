---
name: not-found-page
title: Not found page
type: site
surface: site
description: "Black 404 page with a dotted status code, title, a did you mean suggestion, two outline pills, and index links."
kinds: [page, button-on-brand, link]
use_for: The site's 404. Pass the site's pages as `knownPaths` (most important first) and the closest one to the requested path is offered as "Did you mean" (findClosestPath catches typos and shorthands; the path is read from the address after mount unless `pathname` is given). Two `pill-on-brand` buttons as `actions` (the second with `border-white/40`), the index links as `note`, the white logo as `logo`. `overlay` covers the window above the site's header and footer, as the site does. DotNumber draws any number in the round dots.
never: [The header and footer around it, A blue page background, More than two pills, A suggestion that pushes the page down when it appears]
source: src/app/not-found.tsx; src/components/errors/not-found-view.tsx; src/components/errors/did-you-mean.tsx; src/lib/closest-path.ts; src/components/sections/usecases/step-dot-number.tsx
---
