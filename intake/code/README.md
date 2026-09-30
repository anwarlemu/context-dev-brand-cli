# Existing codebase

Repo: https://github.com/context-dot-dev/brand-dev-webapp (local: `~/Desktop/TRIAGE/Work/Agencidev/brand-dev-webapp`)
Read 2026-09-30 at commit `22e69043`. The homepage was viewed running on localhost:3000.
Screenshots: `intake/screens/home/`.

This is the new context.dev website and the dashboard in one Next.js app. The homepage is the
reference implementation of the brand system.

## Design docs already in that repo

| File | Covers |
|---|---|
| `AGD-DESIGN.md` | Brand system for marketing and pricing pages. Built from the older Figma pages ("4. Brand guidelines", "6. Brand assets"), not the UPDATED ones |
| `design.md` | Dashboard palette and rules. IBM Plex, `#268bff` primary, light and dark themes |
| `PRODUCT.md` | Dashboard users, purpose, principles |
| `eslint.design.config.mjs` | `@shadcn/lint` no-raw-colors and no-arbitrary-values, on an allow-list of migrated files only |

## Two design systems in one app

| Scope | Font | Primary | Where |
|---|---|---|---|
| Marketing and pricing (`.brand-system` on `<main>`) | Rethink Sans, Doto | `#2563EB` | `src/styles/globals.css` `.brand-system`, `src/lib/brand-theme-vars.ts`, `src/lib/brand-fonts.ts` |
| Dashboard, auth, everything else | IBM Plex Sans and Mono | `#268bff` | `.theme-aware` in `src/styles/globals.css`, see `design.md` |

## Homepage section order (`src/app/(marketing)/page.tsx`)

| # | Component | What it is |
|---|---|---|
| 0 | announcement bar | "Introducing /answers: web research in one API call" |
| 0 | `shared/header.tsx` | Logo, Products, Use Cases, Customers (menus), Pricing, Docs, "Book demo", "Start for free" |
| 1 | `shared/hero.tsx` | "Backed by Y Combinator", H1 with blue highlight words, one-line sub, two CTAs, live demo input card, three check items, dot pattern field |
| 2 | `home/featured-logos.tsx` | "Powering agents and products with the world's data." Logo wall, outline CTA |
| 3 | `home/product-grid.tsx` | Section heading, 2x2 product cards (Search, Scrape, Research, Monitor) with Explore pill, tag chips, dot illustration, plus "Also in the API" chips |
| 4 | `home/competitor-comparison.tsx` | "Cheaper, better, faster, stronger at any scale." Tabbed dot-chart benchmark vs Firecrawl, Exa, Parallel |
| 5 | `home/signup-with-agent.tsx` | "Get started in minutes." Two cards: do it yourself (white) and let your agent do it (blue, recommended) |
| 6 | `home/use-cases.tsx` | "One API. Your next feature." Tabbed list plus code window |
| 7 | `home/workflow-grid.tsx` | "Build on what the web knows." 2x3 use-case cards with dot illustrations |
| 8 | `home/trust-strip.tsx` | "Security you can review." Three cards: SOC 2, zero data retention, reliability |
| 9 | `home/testimonials.tsx` | Three quote cards with "Read the case study" |
| 10 | `shared/CustomerStories.tsx` | "How customers shipped with Context.dev". Carousel of blue story cards |
| 11 | `home/blog.tsx` | "Latest updates." on black, 3x2 alternating white and blue post cards |
| 12 | `home/how-it-works.tsx` | "Your first request starts here." Three numbered steps in Doto |
| 13 | `faq.tsx` | "Frequently asked questions". Tabs, accordion, "Ask anything" input |
| 14 | `home/closing-cta.tsx` | "Start building with live web context." with "1,000 free credits" card |
| 15 | `shared/footer.tsx` | Near-black footer, four link columns, SOC badges, status, giant dotted "context.dev" watermark |

`SectionDivider` sits between most sections. Vertical ruler lines frame the content column.

## Repeating patterns (these become registry blocks)

- **Section heading**: headline with the key phrase in blue, one or two lines of muted body under
  it, left-aligned, optional outline pill on the right.
- **Ringed card**: white card inside a pale blue ring (blue 10). Used for product, use-case, trust,
  FAQ and CTA cards.
- **Dot illustration panel**: pale blue ringed panel with a hollow-dot border and a blue dot-drawn
  diagram in the middle. Every product and use-case card has one.
- **Blue card**: solid `#2563EB` card, white text, white outline pill. Customer stories, blog, the
  recommended option.
- **Tag chip**: small pill, white, 1px border at black 15%, neutral 70 text.
- **Code window**: near-black window with tabs, used for SDK and agent prompt samples.

## Measured on the rendered page (desktop, 1440 wide)

The root font size is 90% on desktop, so rem-based sizes render smaller than their tokens.

| Element | Font | Weight | Size |
|---|---|---|---|
| H1 | Rethink Sans | 400 | 56px |
| Section H2 | Rethink Sans | 400 | 39.6 to 50.4px |
| Card H3 | Rethink Sans | 400 | 21.6 to 28.8px |
| Trust card H3, FAQ questions | Rethink Sans | 500 | 16.2px |
| Nav links | Rethink Sans | 500 | 12.6px |
| Footer column headings | Rethink Sans | 600 | 12.6px |

| Button | Fill | Text | Border |
|---|---|---|---|
| Hero and header "Start for free" | black `#000000` / `#222222` | white | black |
| "Book demo" | white | black | black 10% |
| All other CTAs ("Explore", "Read customer stories", "Get API Key"...) | white | `#2563EB` | 1px `#2563EB` |
| "Onboard your agent" | none | `#2563EB` | pale ring |

## Where the site departs from the Figma guidelines

| Figma says | Site does |
|---|---|
| Outline pills only, no filled buttons | Primary "Start for free" is a filled black pill |
| Weight 400 throughout | Mostly 400, but nav 500, small card titles 500, footer headings 600. Anwar has now set headers to 500 |
| Surfaces are white, blue or black | Footer is near-black (`#0D0D0F` range); some headings use a dark navy text colour |
| Display is 64px (UPDATED page) | `AGD-DESIGN.md` says 72px, from the older page |
| No em dashes (the brief's rule) | "search, scraping, people data, company data" subhead uses em dashes |

The repo's own notes say marketing components still hardcode colours and heavier weights and are
being moved onto tokens section by section. A rough count in `src/components/sections`: 684 raw hex
values, 269 `font-medium|semibold|bold` classes.

## Existing agent setup

`AGENTS.md` (coding conventions, no comments, no barrel exports, Next 16 warning), `.claude/skills/`,
`.cursor/rules/`, `.cursor/skills/`. Our harness must merge with these, not overwrite them.
