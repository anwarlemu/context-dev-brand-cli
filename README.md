# context-ds

The Context.dev design system as a harness for AI coding agents. Agents compose pages from locked
templates and registry blocks, get each item's docs at the moment they touch it, and cannot write
off-brand code: a hook checks every write before it reaches disk, and they cannot finish while
`context-ds check` has errors.

Three people typing the same prompt get the same page structure, because structure is a lookup and
a template, not a model decision. Copy is the only thing left to the agent.

## What it does

It puts the Context.dev brand's styling (color, type, spacing, radius, shadow, motion) onto any web
project and keeps coding agents on it. On an existing site it changes how things look and nothing
else: copy, content, markup, layout and page structure stay exactly as they are.

- `init` installs it: the brand tokens (colors, type, spacing, radius, motion as CSS variables),
  short rules in `AGENTS.md` / `CLAUDE.md`, and hooks that check every file an agent writes. Nothing
  on the site changes yet.
- `apply` restyles the site that is already there. It converts the site's own styling, declaration
  by declaration, keeping every selector and element: each color is mapped by the role it plays
  (a dark site becomes the brand's light one: near-black surfaces turn white, white text turns
  black, white hairlines turn black hairlines, accents turn brand blue, greens and reds become the
  status colors), font stacks become Rethink Sans, sizes, weights, radii, spacing, shadows and
  motion move to the nearest brand token, and one-color marks drawn for a dark page are redrawn.
  It adds the brand's page frame (ruled column edges, section rules and nodes), loads the
  typefaces, then lists every component with the recipe to finish it with.
- `style` knows how the brand styles each kind of element in each situation: 155 recipes learned
  from the brand's own site and dashboard (primary button, button on blue, clickable card, pricing
  card, input, nav link, footer, table row, sidebar item, menu, dialog...). `apply` lists every
  element of the site with its recipe, `style <recipe>` prints the declarations (CSS and Tailwind,
  hover, focus and disabled included), and the hooks show an agent the recipe for each element it
  edits. Recipes live in `styles/recipes.json`; open questions in `ASSUMPTIONS.md` 33 to 38.
- From then on, writes with raw values (a hex color, a 13px gap, a stray font) are blocked by the
  hooks, the pre-commit hook and CI, and the agent is told which token to use instead.
- Existing sites run only the style rules (`rules: styles` in `.ds/config.json`). The copy, section
  and template rules, and the templates themselves, are for new apps built from the design system:
  a fresh React + Tailwind 4 app gets them (`rules: all`), or `init --rules all` turns them on.
- New React + Tailwind 4 apps also get the components and page templates (`resolve`, `scaffold`,
  `add`). Other stacks (Astro, Vue, Svelte, plain HTML and CSS) get the tokens and the checks; their
  `<style>` blocks and style attributes are checked too.

Run `npx context-ds` with no arguments for the short version.

## Set it up in any project

Give your coding agent (Claude Code, Codex, Cursor or any other) one of these prompts.

To install it without changing how the site looks:

```text
Set up the Context.dev design system in this project: run
`npx -y github:anwarlemu/context-dev-brand-cli init` and commit the result.
```

To install it and restyle the site with the brand:

```text
Apply the Context.dev design system to this project: run
`npx -y github:anwarlemu/context-dev-brand-cli init`, then `npx context-ds apply`. Restyle every
component it lists with its recipe (`npx context-ds style <recipe>` shows the exact styling) and
fix what `npx context-ds apply --list` shows until it is empty. Change how things look, not what
they say: keep all copy and every element. Show me the result before committing.
```

`init` adds the package to the project (from the `main` branch) and writes the tokens, the rules,
the hooks for Claude Code, Codex and Cursor, the pre-commit hook and the CI workflow. The agent that
runs it is told only about its own setup; the other agents' files are for teammates who use them.
Use `init --dry-run` or `apply --dry-run` first to see what would change. Git does not share
`.git/hooks`, so teammates who clone the project get the pre-commit hook back the first time they
open it with an agent (CI checks either way). Codex users trust the hooks once with `/hooks`.
`npx playwright install chromium` is needed only for `review`.

### Updates

There are no versions to bump. Projects track the `main` branch, so whatever is pushed to `main` is
the release. Each project's lockfile pins the commit it has, so builds and CI stay reproducible
until the project updates:

- At the start of each agent session the hook asks GitHub (at most once a day) whether `main` has
  moved. If it has, the agent is told to run `npx context-ds update` before any UI work.
- `npx context-ds update` installs the newest `main`, refreshes the tokens, contract and hooks, and
  lists installed components that have newer versions. Commit what it changes.
- `npx context-ds update --check` only reports whether a newer commit exists.

Maintainers: push to `main` after `npm run ci` passes. That is the whole release. A commit that
breaks `main` reaches every project that updates, so keep CI green. To pin a project to a commit,
use `github:anwarlemu/context-dev-brand-cli#<sha>` in its `package.json`.

## Use it locally

One-time, in this repo:

```sh
npm run setup        # install, build the CLI, tokens and registry, run the tests
```

In any app (a fresh Next.js app, or an existing one):

```sh
npm i -D ~/Desktop/TRIAGE/Work/Agencidev/context-dev-brand-cli
npx context-ds init --dry-run     # see exactly what it will change
npx context-ds init
```

Then work in Claude Code as usual. Ask for "the pricing page" and the hooks do the rest: resolve,
scaffold, docs, checks, review. Or run the commands yourself:

```sh
npx context-ds resolve "build the pricing page"
npx context-ds scaffold pricing
npx context-ds check
npx context-ds review app/pricing/page.tsx
```

- The app links to this folder, so after you change the design system, run `npm run build &&
  npm run registry:build` here and every linked app picks it up. Installed components update with
  `npx context-ds add <name> --overwrite`.
- Items install from this package (`registryMode: "local"` in `ds.config.json`). Once the registry
  is hosted, set `registryMode` to `remote` and `registryUrl` to its address.
- `review` uses `ANTHROPIC_API_KEY` if set, otherwise your Claude Code login (`claude -p`). It starts
  the app's own dev server; set `DS_REVIEW_BASE_URL` to review a server that is already running.

### In brand-dev-webapp

`init` detects that app as existing (scoped mode) and:

- checks only the layouts that use the `brand-system` class (`(marketing)`, `(pricing)`) plus
  `components/ds`, so the dashboard keeps its own system. Add the section components with
  `--scope "src/app/(marketing)/**" "src/app/(pricing)/**" "src/components/sections/**"`;
- keeps the app's own values for the 49 theme names it already defines, so the live site does not
  change until you choose to align them;
- does not add a second font loader;
- baselines the existing findings (about 1,765 in the marketing pages, 5,826 with the section
  components), so only new code is held to the rules.

Run `init --dry-run` there first. Do it on a branch.

## Product surfaces (the dashboard)

The system also covers signed-in product screens, learned from the context-dashboard prototype:
`product.md` holds the product principles, and the `app-*` items, blocks and templates hold its
components with their variants and states (`npx context-ds docs` lists them under "product").

- Product tokens apply under the `ds-product` class: the 15px root, the product type scale (12.6px
  main UI size), canvas and frame surfaces, the wash hover, hairline shadows, squareish radii, chart
  colors, and a dark theme switched by `data-theme="dark"` on `<html>`.
- Put `className="ds-product"` on `<html>` in the app's root layout and build the layout from the
  `app-shell` template. Marketing pages and product pages can live in one app; only the product
  routes carry the class.
- `resolve` maps dashboard, list, detail, form, settings and playground tasks to the `app-*`
  templates. `review` judges product pages against `product.md` and `review/rubric.product.md`.
- Reference screens (light, dark and states) are in `intake/screens/dashboard/`.

## How it keeps agents on brand

| Moment | What happens |
|---|---|
| Session start | The agent is told the design system is active and to resolve the task first (6 lines) |
| Prompt | `resolve` maps the task to a template by lookup; that template's docs are injected, nothing else |
| Before every write | `check --fast` runs on the proposed content. New errors block the write (exit 2) with fix hints. If clean, docs for each registry item imported in the file are injected, once per session |
| After `add` or `scaffold` | The added items' docs are injected |
| Stop | Full check on changed files. Errors block completion. Changed pages trigger one "run review" |
| Commit and CI | The same check in the git pre-commit hook and CI |

Per agent: Claude Code and Codex block a bad write before it lands and refuse to finish while errors
remain (Codex: tested live with `apply_patch`; trust the project hooks once with `/hooks`). Cursor
denies the write through `preToolUse` and sends the agent back at `stop` (checked against Cursor's
hook docs, not yet in a live session). Agents with no hooks are caught by `watch` as files save, by
the pre-commit hook and by CI. `info` shows when each agent's hooks last ran and how often they
blocked, so you can see they are live.

The only escape hatch is `// ds-override: <reason>`, on the line above a finding or on line 1 for a
file. An override does not count until a person approves it with `approve` (recorded in
`.ds/approved-overrides.json`, which you commit). Until then `override-approval` fails the Stop hook,
the pre-commit hook and CI. Overrides in installed registry files and those present at `init` are
accepted.

Always-loaded context is the 11-line contract in `AGENTS.md` / `CLAUDE.md`. Any single docs
injection is capped at 80 lines, enforced by `npm run ci`.

## Commands

All commands take `--json` and `--help`.

| Command | |
|---|---|
| `init [--mode new\|scoped] [--harness ...]` | Install into a project |
| `style [recipe] [--detect <files>] [--for <selector>] [--surface marketing\|product]` | How the brand styles a kind of element per situation; `--detect` matches a file's elements to recipes |
| `apply [--dry-run] [--list [paths]]` | Restyle the existing site with the brand (styling only), then list the style values left |
| `info` | Framework, tokens, installed items and drift, hooks, baseline |
| `resolve "<task>"` | Task to template, by lookup against `intents.json` |
| `scaffold <template> [--slot s=block] [--out path] [--force] [--local]` | Page from a locked template |
| `docs [name]` | One item's docs, or the index |
| `add <names...> [--dry-run] [--diff] [--overwrite] [--local]` | Install through the shadcn CLI and record versions |
| `tokens <path> \| --search <term>` | Value, CSS variable, Tailwind class |
| `check [paths] [--fix] [--fast] [--changed] [--write-baseline]` | The rules below |
| `review [url\|path] [--viewports] [--threshold 7]` | Needs `ANTHROPIC_API_KEY`; model from `DS_REVIEW_MODEL` or ds.config.json |
| `diff` | Items behind the registry or edited by hand |
| `watch` | Check every file the moment it is saved. For agents and editors without hooks |
| `update [--check]` | Install the newest design system from its source branch and refresh what `init` wrote |
| `approve [--list]` | A person reviews and approves `ds-override` exceptions. Refuses to run without an interactive terminal, so agents cannot approve their own |

## Check rules

`no-raw-color`, `no-arbitrary-spacing`, `no-off-scale-radius`, `no-off-scale-motion`,
`font-family-from-tokens` (family, weight, size, tracking), `copy-rules` (voice.md header),
`contrast`, `template-structure`, `no-unregistered-section`, `variant-from-list`, `registry-drift`,
`single-primary-action`, `override-approval`. Levels live in `checks/check.config.json`; a project can override them in
`.ds/check.config.json`. `test/fixtures/violations` has one violation per rule and
`test/fixtures/expected.json` the expected result.

## Repo layout

| Path | |
|---|---|
| `intake/` | What the brand owner supplied. Read-only |
| `principles.md`, `voice.md`, `intents.json` | Point of view, copy rules (YAML header is machine-read), task lookup |
| `tokens/` | DTCG source in three tiers, plus `contrast-pairs.json` |
| `build/` | Generated: `tokens.css`, `theme.css` (Tailwind v4), `theme.scoped.css`, `tailwind.preset.ts`, `contrast-report.md` |
| `registry/{ui,blocks,templates}/<name>/` | Source, `docs.md`, one example |
| `public/r/`, `public/r-local/` | shadcn build output (hosted, and local with dependencies flattened) |
| `src/` | The engine. No brand strings: everything comes from the files above |

## Changing the system

- **A token:** edit `tokens/`, run `npm run tokens`. The build fails if a listed pair drops under AA.
- **A rule:** add `src/check/rules/<rule>.ts`, register it in `src/check/rules/index.ts`, add it to
  `checks/check.config.json`, add a fixture and a line in `test/fixtures/expected.json`.
- **A block:** `registry/blocks/<name>/` with `<name>.tsx` (root `<Section block="<name>">`),
  `docs.md` (closed `variants`, `dependencies`), and `<name>.example.tsx` rendering the block once
  with literal props: scaffold copies that JSX into pages. Then allow it in a template slot.
- **A template:** `registry/templates/<name>/` with the slot component and `structure:` in docs.md.
  Per-template copy for a slot goes in `slots/<slot>.<block>.example.tsx`. Map task words to it in
  `intents.json`.
- **The dot animations, benchmark chart and hero demo:** `npm run port` re-syncs all three from the
  website. The dot animations are ported from the website, which stays the source of truth for
  motion. When the site's animations change, run `node scripts/port-dots.mjs <path to brand-dev-webapp>`.
  It copies the engine, the 31 story scenes, blog covers, trust marks, customer logos, the credits
  figure, the hero field and the footer watermark into `registry/ui`, rewrites imports, and applies
  the token patches listed in the script (colors become `var(--ds-...)` resolved at paint time;
  offscreen luminance masks carry a `ds-override`). A patch that no longer applies is printed.
  To add a scene, port it, then add it to `dot-story/dot-scene.tsx` (generated) and its docs table.
- Then `npm run registry:build && npm run ci`.

Breaking changes to the docs frontmatter, slot schema or `ds.config.json` bump the major version.
