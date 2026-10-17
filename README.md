# context-ds

The design system for the Context.dev team and coding agents building its pages and interfaces. The library contains
React and Tailwind components, page layouts, visual assets, and design tokens. Browse the reference at
https://context-ds.vercel.app. The CLI adds components and checks implementation against the design system.

The CLI can also adapt existing interfaces across React, HTML/CSS, other web frameworks, and native stacks. That
conversion changes styling while preserving copy, elements, and screen purpose.

## Use it

For a new page or interface, give the agent these instructions:

```text
Use the Context.dev design system at https://context-ds.vercel.app.
Read the relevant component usage notes and source before implementing.
Reuse the components and tokens for the product or site surface.
Run npx context-ds check --changed and test the page at desktop and phone sizes.
Review the result against the reference before marking the task complete.
```

To set up or adapt an existing project, run `npx -y github:anwarlemu/context-dev-brand-cli#release` from its root.
The CLI first identifies the app's components: what each one is, from its name, what it renders, its props
and how it is used. In a React + Tailwind app, a component the library covers either renders the library's (its props
mapped, its name and every use unchanged), or, where that would lose something, takes the library item's look on the
element it renders; in any stack, stylesheet classes it recognizes get that element's brand styling. Anything nothing
covers keeps its own design with brand values. The app is type-checked before and after, and a swap that would break
it goes back. Every decision and its reason is in `.ds/components.json`. The first run also adds the package to the project, reads whether it is a site or a product, converts every
style value to the brand (colors by the role they play, type, spacing, radius, shadows, motion), installs the brand
stylesheet and fonts, and writes short rules and hooks for the agents. Then each run prints one task: one screen,
with the elements to restyle and how. A task is done when the screen passes `review` (screenshots at desktop and
phone width, scored against the brand's own pages) and every value in its files is a brand token. When every main
screen is done it says so.

From then on the hooks (Claude Code, Codex, Cursor) and a git pre-commit check block any write that adds an off-brand
value, so new work stays on the brand.

## The library

Run `npm run doctor` to audit the complete docs site with the pinned React Doctor version. `npm run doctor:library`
audits the shared registry source separately. Both commands report every finding; neither disables rules.

Product components and the docs shell follow `context-dashboard` at `c0ddf7a`; marketing-only components keep the
website redesign reference. The docs use the registry's sidebar, top bar, page headers, cards, search palette, and
preview controls directly. Product previews use the dashboard's 15px root; site previews keep their own document scale.

After a production build, start the docs on port 3109 and run `npm run check:docs` for desktop/mobile navigation,
search, preview hydration, and overflow checks. Set `DOCS_URL` to check another deployment and
`DASHBOARD_REFERENCE_URL` to compare the sidebar's computed styles with a running reference checkout. Set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if Chromium is installed outside Playwright's default location.

The docs project's Vercel Toolbar must stay disabled for preview and production deployments. Its injected cookie
check throws inside the sandboxed example frames and prevents React from starting, including the preview size reporter.

Every component, block and visual from Context.dev's site (the redesign branch) and product (the dashboard), for
React and Tailwind 4. Components are copied into your project as source you own (nothing to import from a package): buttons and pills, forms, overlays, menus, tables, charts, the product
shell and pages, the site's header, hero, sections, pricing and FAQ, and the dot visuals (hero dot streams and 43
stories). Each has a live preview, its code and its install command on the site.

```sh
npx context-ds add button card tabs       # copies them in, with what they need and the theme
```

Product screens opt into the compact product scale with the `ds-product` class (or `<Surface kind="product">`).

## Commands

| Command | Does |
|---|---|
| `npx context-ds` | First run: install and convert. Every run after: the next task. `--surface site\|product`, `--theme dark` (product), `--redo`, `--dry-run`. |
| `npx context-ds add <items...>` | Copies library components into a React + Tailwind project, with the items they need, the theme and their packages. |
| `npx context-ds list` | Every component, block and visual in the library. |
| `npx context-ds review <url>` | Screenshots at desktop and phone width, scored against the brand; checks off the screen's task at 7 or more. |
| `npx context-ds look <file\|element>` | The brand styling (CSS, Tailwind, states) for every element in a file, or one element kind. |
| `npx context-ds check [files]` | Every style value must be a brand token. `--fix` for exact matches, `--changed` for git changes. |
| `npx context-ds tokens [term]` | Find a token. |
| `npx context-ds approve` | A person approves `ds-override` comments in a terminal. Agents cannot. |
| `npx context-ds done <screen>` | Marks a native screen restyled (web screens are checked by `review`). |
| `npx context-ds skip <screen> --reason "..."` | Leaves a screen as it is when it cannot pass without changing words or elements; the final summary lists each skip and why. |

`review` runs on the agent's own subscription: through Codex (`codex exec`) or Claude Code (`claude -p`), whichever is
running, or the Anthropic API when a key is set. In any other agent (Cursor, Hermes and the rest) it saves the screenshots
and the agent scores them itself; the final summary says which screens were scored that way. It needs
`playwright-core` with Chromium (`npx playwright install chromium`).

## What it brings

The site: a white page, black type at weight 400, blue only for the closing phrase of headings and for accents,
the ruled column with section rules and nodes, white cards in a soft blue ring, black primary pill and outline blue
pills, quiet dot streams at the edges of the home hero. The product: the canvas page, white cards whose hairline is
part of the shadow, a compact 12.6px UI, neutral navigation, one blue main action per screen.

Everything brand-specific lives in `brand/`: `tokens.css` (every value), `site.css` and `product.css` (the base
layers), `elements.json` (how each kind of element is styled, with its source in the brand's code), `reference/`
(screenshots of the brand's own pages, used by `review`), `principles.md`, `rubric.md` and `contract.md`.
