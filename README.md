# context-ds

The Context.dev design system as a harness for AI coding agents. Agents compose pages from locked
templates and registry blocks, get each item's docs at the moment they touch it, and cannot write
off-brand code: a hook checks every write before it reaches disk, and they cannot finish while
`context-ds check` has errors.

Three people typing the same prompt get the same page structure, because structure is a lookup and
a template, not a model decision. Copy is the only thing left to the agent.

## For teammates

You need read access to `anwarlemu/context-dev-brand-cli` on GitHub. In your app:

```sh
npm i -D github:anwarlemu/context-dev-brand-cli#v0.1.1
npx context-ds init --dry-run     # preview
npx context-ds init
npx playwright install chromium    # only for review
```

Then use Claude Code as usual. `review` uses your `ANTHROPIC_API_KEY`, or your Claude Code login if
no key is set. To update, change the tag in `package.json` (for example `#v0.1.2`) and run `npm install`.

Releasing a new version (maintainers): commit, run `npm run ci`, bump `version` in `package.json`,
then `git tag -a vX.Y.Z -m "context-ds X.Y.Z" && git push origin main vX.Y.Z`.

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

## How it keeps agents on brand

| Moment | What happens |
|---|---|
| Session start | The agent is told the design system is active and to resolve the task first (6 lines) |
| Prompt | `resolve` maps the task to a template by lookup; that template's docs are injected, nothing else |
| Before every write | `check --fast` runs on the proposed content. New errors block the write (exit 2) with fix hints. If clean, docs for each registry item imported in the file are injected, once per session |
| After `add` or `scaffold` | The added items' docs are injected |
| Stop | Full check on changed files. Errors block completion. Changed pages trigger one "run review" |
| Commit and CI | The same check in the git pre-commit hook and CI |

The only escape hatch is `// ds-override: <reason>`, on the line above a finding or on line 1 for a
file. Every override is listed in check output and at Stop.

Always-loaded context is the 11-line contract in `AGENTS.md` / `CLAUDE.md`. Any single docs
injection is capped at 80 lines, enforced by `npm run ci`.

## Commands

All commands take `--json` and `--help`.

| Command | |
|---|---|
| `init [--mode new\|scoped] [--harness ...]` | Install into a project |
| `info` | Framework, tokens, installed items and drift, hooks, baseline |
| `resolve "<task>"` | Task to template, by lookup against `intents.json` |
| `scaffold <template> [--slot s=block] [--out path] [--force] [--local]` | Page from a locked template |
| `docs [name]` | One item's docs, or the index |
| `add <names...> [--dry-run] [--diff] [--overwrite] [--local]` | Install through the shadcn CLI and record versions |
| `tokens <path> \| --search <term>` | Value, CSS variable, Tailwind class |
| `check [paths] [--fix] [--fast] [--changed] [--write-baseline]` | The rules below |
| `review [url\|path] [--viewports] [--threshold 7]` | Needs `ANTHROPIC_API_KEY`; model from `DS_REVIEW_MODEL` or ds.config.json |
| `diff` | Items behind the registry or edited by hand |

## Check rules

`no-raw-color`, `no-arbitrary-spacing`, `no-off-scale-radius`, `no-off-scale-motion`,
`font-family-from-tokens` (family, weight, size, tracking), `copy-rules` (voice.md header),
`contrast`, `template-structure`, `no-unregistered-section`, `variant-from-list`, `registry-drift`,
`single-primary-action`. Levels live in `checks/check.config.json`; a project can override them in
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
- **The dot animations:** they are ported from the website, which stays the source of truth for
  motion. When the site's animations change, run `node scripts/port-dots.mjs <path to brand-dev-webapp>`.
  It copies the engine, the 31 story scenes, blog covers, trust marks, customer logos, the credits
  figure, the hero field and the footer watermark into `registry/ui`, rewrites imports, and applies
  the token patches listed in the script (colors become `var(--ds-...)` resolved at paint time;
  offscreen luminance masks carry a `ds-override`). A patch that no longer applies is printed.
  To add a scene, port it, then add it to `dot-story/dot-scene.tsx` (generated) and its docs table.
- Then `npm run registry:build && npm run ci`.

Breaking changes to the docs frontmatter, slot schema or `ds.config.json` bump the major version.
