# Assumptions for the brand owner to confirm

Each is in force today; each names where it lives, so a change is one edit.

1. Sources. Site values were measured from brand-dev-webapp `agencidev/redesign-dashboard-and-website` at bc043ae59
   (2026-10-14), product values from context-dashboard at c0ddf7a (2026-10-13). `brand/tokens.css`, `brand/elements.json`.
2. Restyled sites render the rem scale at 90% from 43.2rem, as the brand's site does. `brand/site.css`.
3. Dots on a restyled site: only thin streams at the edges of the home hero. Nothing else gets dots, since illustrations
   are content. `brand/dots.js`, `src/plan/tasks.ts`.
4. Blue in headings: the closing words of the hero headline and of section headings, wrapped by the agent in
   `ds-accent`. Words never change. `brand/contract.md`.
5. Section headings are left aligned with their description below, as on the brand's home. `brand/elements.json`.
6. Headings converted from a site's bold weights become weight 400; other bold text becomes 500. `src/convert/css.ts`.
7. A card without a wrapper element gets its soft blue ring as a spread shadow (its outer corner is slightly rounder
   than the site's wrapper ring). `brand/elements.json` (card).
8. A product keeps one blue main action per screen; a site keeps one black primary pill. `brand/elements.json`.
9. A dark product may stay dark (`--theme dark`); a dark site always becomes the brand's light one.
10. Raster logos drawn for a dark page are listed for the agent, not recolored. `src/convert/project.ts`.
11. Review passes at 7 on every score. `brand/brand.json`.
12. The repo is public, so `intake/` (the brand owner's inputs) is public too. Make the repo private or move intake out.
