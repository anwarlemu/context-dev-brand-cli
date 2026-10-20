# context-ds

The design system for the Context.dev team and coding agents building its pages and interfaces. The library contains
React and Tailwind components, page layouts, visual assets, and design tokens. Browse the reference at
https://context-ds.vercel.app. The CLI adds components and checks implementation against the design system.

The CLI can also adapt existing interfaces across React, HTML/CSS, other web frameworks, and native stacks. That
conversion changes styling while preserving copy, elements, and screen purpose.

## Use it

Read [the agent guide](https://context-ds.vercel.app/agents.md). It works with any agent that can read text or run a shell. No API key is needed; this design-system CLI is separate from the Context.dev web-data CLI.

```sh
# Read-only discovery, before installing anything
npx -y github:anwarlemu/context-dev-brand-cli#release guide
npx -y github:anwarlemu/context-dev-brand-cli#release list "form" --surface product --json
npx -y github:anwarlemu/context-dev-brand-cli#release inspect field input button --json

# Set up a new page or feature without converting existing component styles
npx -y github:anwarlemu/context-dev-brand-cli#release init --surface product
npx context-ds add field input button --surface product --dry-run --json
npx context-ds add field input button --surface product --json
npx context-ds check --changed --json
```

Run `add` from the target app's root. It copies React components only into React 19.2+ and Tailwind CSS 4 projects with an `@/*` alias in TypeScript and the bundler. Use `--surface product` for an app or `--surface site` for marketing pages. To apply the brand to another framework, run the top-level CLI command instead. Connect real application state and routes; examples use local demo state. Run the app's own checks and test keyboard, pointer, validation, overlays, and scrolling in a browser before visual review.

Agents can read `/llms.txt`, `/llms-full.txt`, `/agents.md`, `/r/index.json`, `/components/{name}.md`, and `/r/{name}.json` on the docs site. Each item includes usage rules, actual TypeScript declarations, complete source, examples with their relative helpers, dependencies, and reference coverage. The CLI bundles the same registry for offline inspection. Check the revision when mixing hosted and bundled versions.

To **restyle an existing interface**, preview `npx -y github:anwarlemu/context-dev-brand-cli#release --dry-run --json` from its root, then run without `--dry-run`. The default command changes styles on its first run.
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

Project rules live in AGENTS.md and .ds/guide.md. Hooks are also installed for supported hosts; activation depends on the host configuration. Every agent can run the explicit CLI checks, regardless of hook support.

## The library

Run `npm run doctor` to audit the complete docs site with the pinned React Doctor version. `npm run doctor:library`
audits the shared registry source separately. Both commands report every finding; neither disables rules.

Product components and the docs shell follow `context-dashboard` at `c0ddf7a`; marketing-only components keep the
website reference. The docs use the registry's sidebar, top bar, page headers, cards, search palette, and
preview controls directly. Product previews use the dashboard's 15px root; site previews keep their own document scale.

After a production build, start the docs on port 3109 and run `npm run check:docs` for desktop/mobile navigation,
search, preview hydration, and overflow checks. Set `DOCS_URL` to check another deployment and
`DASHBOARD_REFERENCE_URL` to compare the sidebar's computed styles with a running reference checkout. Set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if Chromium is installed outside Playwright's default location.

Run `npm run check:library` against the same server to exercise validation, overlays, menus, clipboard, keyboard controls, and page actions, then render every example at desktop and phone widths. `LIBRARY_CRAWL=0` runs only the interaction checks. Results are written to `LIBRARY_CHECK_OUTPUT` (default `/private/tmp/context-library-review`).

Every preview runs in its own sandboxed frame so dialogs and menus stay inside the example. Example forms and account actions update local demo state. Product blocks expose navigation through a cancelable `ds:navigate` event; the docs route those actions to other examples.

The docs project's Vercel Toolbar must stay disabled for preview and production deployments. Its injected cookie
check throws inside the sandboxed example frames and prevents React from starting, including the preview size reporter.

Components, blocks, and visuals from the Context.dev website and dashboard, for
React 19.2+ and Tailwind 4. The reference coverage record distinguishes current public pages from retained source-only variants. Components are copied into your project as source you own (nothing to import from a package): buttons and pills, forms, overlays, menus, tables, charts, the product
shell and pages, the site's header, hero, sections, pricing and FAQ, and the dot visuals (hero dot streams and 43
stories). Each has a live preview, its code and its install command on the site.

```sh
npx context-ds add button card tabs       # copies them in, with what they need and the theme
```

Product documents use a 15px root and `ds-product` (or `<Surface kind="product">`). Site documents use 16px on phones and 90% from 43.2rem up. The installed stylesheet sets the root scale; a Surface wrapper alone does not change rem-based spacing.

## Commands

| Command | Does |
|---|---|
| `npx context-ds` | First run: install and convert. Every run after: the next task. `--surface site\|product`, `--theme dark` (product), `--redo`, `--dry-run`. |
| `npx context-ds add <items...>` | Copies library components into a React + Tailwind project, with the items they need, the theme and their packages. |
| `npx context-ds guide` | Agent workflow, without changing files. |
| `npx context-ds init --surface site\|product` | Theme, fonts, and instructions for building; no conversion of existing component styles. |
| `npx context-ds list [query]` | Search all items; `--surface`, `--type`, `--json`. |
| `npx context-ds inspect <items...>` | Actual API, usage, dependencies, and examples; `--json` includes full source. |
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

## Reference checks

`npm run audit:references` resolves all documented source files against pinned, read-only reference commits and records source hashes. Set `WEBSITE_REFERENCE`, `DASHBOARD_REFERENCE`, and their `_COMMIT` counterparts when intentionally updating references. CI rejects library source changes that have not been audited. This coverage distinguishes current website source, retained variants, dashboard-only components, and library infrastructure; it does not claim pixel identity for every variant.

With the docs running, `npm run check:references` compares shared computed styles with the current public website at desktop and phone widths. `brand/reference-measurements.json` records the latest accepted measurements and inspected public pages. Refresh the measurements and audit together when the reference changes.
