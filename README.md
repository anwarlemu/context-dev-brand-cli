# context-ds

Make any website or app look like Context.dev, and keep coding agents on it.

It works on anything: a marketing site or a product (dashboard, admin, app), in any stack or language: plain HTML
and CSS, Astro, Next, Vue, Svelte, Tailwind, CSS-in-JS, server templates, SwiftUI, Compose, Flutter and more. It
changes how things look and never what they say: every word, element and screen's purpose stays as it is.

## Use it

Give your coding agent (Claude Code, Codex, Cursor or any other) this prompt:

```text
Apply the Context.dev design system to this project: run
`npx -y github:anwarlemu/context-dev-brand-cli` and do what it says until it says you are done.
Change how things look, never what they say.
```

That is all. The first run adds the package to the project, reads whether it is a site or a product, converts every
style value to the brand (colors by the role they play, type, spacing, radius, shadows, motion), installs the brand
stylesheet and fonts, and writes short rules and hooks for the agents. Then each run prints one task: one screen,
with the elements to restyle and how. A task is done when the screen passes `review` (screenshots at desktop and
phone width, scored against the brand's own pages) and every value in its files is a brand token. When every main
screen is done it says so.

From then on the hooks (Claude Code, Codex, Cursor) and a git pre-commit check block any write that adds an off-brand
value, so new work stays on the brand.

## Commands

| Command | Does |
|---|---|
| `npx context-ds` | First run: install and convert. Every run after: the next task. `--surface site\|product`, `--theme dark` (product), `--redo`, `--dry-run`. |
| `npx context-ds review <url>` | Screenshots at desktop and phone width, scored against the brand; checks off the screen's task at 7 or more. |
| `npx context-ds look <file\|element>` | The brand styling (CSS, Tailwind, states) for every element in a file, or one element kind. |
| `npx context-ds check [files]` | Every style value must be a brand token. `--fix` for exact matches, `--changed` for git changes. |
| `npx context-ds tokens [term]` | Find a token. |
| `npx context-ds approve` | A person approves `ds-override` comments in a terminal. Agents cannot. |
| `npx context-ds done <screen>` | Marks a native screen restyled (web screens are checked by `review`). |

`review` runs through the Anthropic API when a key is set, or through a logged-in Claude Code (`claude -p`), and needs
`playwright-core` with Chromium (`npx playwright install chromium`).

## What it brings

The site: a white page, black type at weight 400, blue only for the closing phrase of headings and for accents,
the ruled column with section rules and nodes, white cards in a soft blue ring, black primary pill and outline blue
pills, quiet dot streams at the edges of the home hero. The product: the canvas page, white cards whose hairline is
part of the shadow, a compact 12.6px UI, neutral navigation, one blue main action per screen.

Everything brand-specific lives in `brand/`: `tokens.css` (every value), `site.css` and `product.css` (the base
layers), `elements.json` (how each kind of element is styled, with its source in the brand's code), `reference/`
(screenshots of the brand's own pages, used by `review`), `principles.md`, `rubric.md` and `contract.md`.
