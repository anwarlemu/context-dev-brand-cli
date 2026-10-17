# context-ds

Context.dev's design system as a library and a CLI: the components, blocks and visuals of Context.dev's own site and
product for React and Tailwind, browsable at https://context-ds.vercel.app, and one command that applies them to any
project and keeps coding agents on the brand.

It works on anything: a marketing site or a product (dashboard, admin, app), in any stack or language: plain HTML
and CSS, Astro, Next, Vue, Svelte, Tailwind, CSS-in-JS, server templates, SwiftUI, Compose, Flutter and more. It
changes how things look and never what they say: every word, element and screen's purpose stays as it is.

## Use it

Give your coding agent (Claude Code, Codex, Cursor, Hermes or any other) this prompt:

```text
Apply the Context.dev design system to this project: run
`npx -y github:anwarlemu/context-dev-brand-cli#release` and do what it says until it says you are done.
Change how things look, never what they say.
```

That is all. It first identifies the app's components: what each one is, from its name, what it renders, its props
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
