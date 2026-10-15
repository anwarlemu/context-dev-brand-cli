# Assumptions for the brand owner to confirm

Everything here is in force in the harness today. Each line says where it lives, so a change is one edit.

## Point of view (`principles.md`)

1. Buyer: the engineer or technical founder who owns their product's web data or agent pipeline. No job title was given.
2. Sign-off: Yahia Bakour.
3. Core flows: land, understand, see the benchmark; sign up or paste the agent prompt; get a key and make a first request.
4. Never change: logo and clear space, `#2563EB`, Rethink Sans, Doto, the circle story, the footer's legal links and SOC badges.
5. Reference sites: firecrawl, resend, modal, greptile (want); usenotch.ai, tinyfish.ai (refuse). A third refuse site is still missing.

## Visual system (`tokens/`, `registry/`)

6. Headers use Rethink Sans 500 (your decision). Body 400. The Figma file and the live site use 400 for headers today.
7. Display is 64px (Figma UPDATED page). The site's `AGD-DESIGN.md` says 72px.
8. The primary action is a filled black pill, as on the live site. Figma shows outline pills only.
9. Neutrals are allowed for text, borders and quiet panels only. The onboarding form says "grays are dangerous".
10. Muted text is neutral 70 `#4D4D4D`, borders neutral 10 `#E6E6E6`, from the website code.
11. Status colors are not in the guidelines: success `#15803D`, warning `#B45309`, danger `#DC2626`.
12. Code font is IBM Plex Mono, from the website. The guidelines name none.
13. Blue text on the blue 10 tint is 4.49:1, a hair under AA, so it is allowed for large text only.
14. Radius scale is 4px, 8px (cards), 12px (windows), pill. Spacing is the 4px scale 0 to 128px.
15. The primary horizontal lockup is the blue mark with black wordmark.

## Voice (`voice.md`)

16. Word limits: headline 12, subheadline 24, button 5.
17. "AI" is allowed (the tagline uses it). "Powerful" is allowed. The banned list is a starter set.
18. American spelling, sentence case, "New:" for announcements.
19. Liked and rejected lines are drawn from the designs, not picked by you.

## Scope

20. The harness covers marketing, pricing and product (dashboard) pages. Auth screens and emails are routed out of scope. (Earlier, the dashboard kept its own system; it is now learned from context-dashboard, see Product below.)
21. v1 templates: landing, pricing, product. No flows yet, because the flows would live in the dashboard.
22. Registry URL `https://context-ds.vercel.app` is a placeholder. Nothing is deployed. `add --local` installs from the package.
23. Binary and package name: `context-ds`.

## Example copy that needs a real source before it ships

24. Testimonial attributions are role and company only. Real names and permission are needed.
25. The `answers` SDK snippet in code-showcase was inferred from FAQ text, not checked against the SDK.
26. Benchmark numbers (94, 97, 92 and the competitor values) are copied from the live homepage chart.

## Product (`product.md`, `app-*` items, learned from context-dashboard at c0ddf7a)

27. `product.md` treats the context-dashboard prototype (markwillcraft/context-dashboard) as the product reference. It overrides `principles.md` inside the product: canvas gray page, squareish 8px controls, a filled blue main action, the glass hover ring. Confirm the prototype is the direction for the real dashboard.
28. Focus: the dashboard removes focus rings by design. The harness shows the brand glass ring on keyboard focus instead (`focus-visible:shadow-ring-hover`), for accessibility.
29. Dark theme: the dashboard's dark brand blue `#3B73ED` is 4.22:1 as text on the dark surface. Brand text and edges use blue-80 `#5182EF` (5.03:1) in dark (`text-accent`, `border-accent`); filled brand stays `#2563EB` so white labels are 5.17:1.
30. Copy: the dashboard uses Title Case card titles ("Credits Used Today"). Product copy follows `voice.md` sentence case; product names keep their capitals.
31. Product figures are Rethink Sans with tabular numbers, as in the dashboard. Doto stays for the credits glyph and dot charts.
32. The product items were ported by hand, not by a script, because the dashboard's classes needed mapping to tokens. When the dashboard changes, re-port the affected item and bump its version.

## Recipes (`styles/recipes.json`, how each kind of element is styled)

Learned from brand-dev-webapp `agencidev/redesign-dashboard-and-website` (marketing) and context-dashboard `c0ddf7a` (product). Values the sources disagree on, and values with no token yet, are in `styles/recipes.notes.json`.

33. Heading weight: the tokens set h1 to h5 at 500; the Figma guide (`AGD-DESIGN.md`, "Regular 400") and the live site (`font-normal`) use 400. Recipes reference `var(--ds-text-hN-weight)`, so changing that one token settles it. Brand owner to choose.
34. Headline tracking: the site sets -0.035em on redesigned headlines; the brand guide says 0 and the check rejects tracking. Recipes use 0.
35. Card ring: the site draws it as a 10% blue wrapper with 8px padding and an 8% black hairline on the card; the registry `card` uses a solid tint, 4px padding and a 12px outer radius. Recipes follow the site; the registry card should be aligned.
36. Buttons: recipes use the brand pill and the system's hover `#191919`. The site also has a header-only `#222` button with hover `#333` and legacy `#268bff` buttons; those are not recipes.
37. Motion: hover and color transitions use ease-out at the 150 to 250ms tokens. Both sources used ease-in-out for color, and the site's header morph (500ms) and dropdown (300 to 400ms) run longer; recipes hold them to the animation rules.
38. Size: the site renders rem at 90% from 43.2rem and the dashboard uses a 15px root, so recipes in CSS read about 6 to 10% larger than the live pages at nominal token sizes. The Tailwind forms match under `.ds-product`.
