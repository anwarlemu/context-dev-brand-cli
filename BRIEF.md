# Build brief: `context-ds`, a design system harness for AI coding agents

Brand: Context.dev. Binary and package: `context-ds`. Repo: `context-dev-brand-cli`.
Registry: https://context-ds.vercel.app (not deployed yet). Site: https://www.context.dev.

## 0. Why this exists

Stripe's design team (Katie Dill, Lenny and Friends Summit, Sept 2026) tried to make AI agents build on-brand by giving them an MCP server over their design docs. It failed for a specific reason: "it wasn't specific enough, and it wasn't driving the right outcomes. Three different people could put in the same prompt and get three different results."

They replaced it with a CLI built on the design system. Her words: "It makes a harness that makes the AI far more obedient. It's where the builders are building, and it consumes the documentation at the right time and place to avoid context rot." And the system changed shape: "not just components and atomic parts, but full templates and flows. The system actually knows what our product is supposed to behave like." They "embed these standards into the means of production."

This repo is that harness for Context.dev: a single self-contained repo, `context-dev-brand-cli`, that publishes one CLI, `context-ds`. The repo holds the engine (commands, check rules, review, hooks, skill) and Context.dev's design system (tokens, registry, principles, voice, intents). Nothing in it refers to any other brand.

## 1. The four outcomes and exactly how each is achieved

Every design decision serves one of these. If unsure how to implement something, pick the option that better serves the outcome in this table.

| Outcome | Failure it prevents | Mechanism | Test that proves it |
|---|---|---|---|
| **Same prompt, same result** | Three builders, three layouts | (a) Agents compose from templates and blocks, they never generate page structure. (b) `intents.json` maps task keywords to a template by lookup, not by model judgement. (c) Templates have locked slots; each slot has an enumerated list of allowed blocks and a default. (d) `context-ds check` fails any top-level section not sourced from the registry. | M8: three fresh runs of the same prompt produce an identical component tree (structural diff = 0). Copy may differ, structure may not. |
| **Obedience** | Agent reads the rules, ignores them anyway | Rules are code, not prose. (a) `PreToolUse` hook blocks any file write containing raw color, off-scale spacing, banned copy, or unregistered sections, before it hits disk. (b) `Stop` hook refuses to let the agent finish while `context-ds check` has errors. (c) Pre-commit and CI run the same check. (d) The only escape hatch is an explicit `// ds-override: <reason>` line that is reported in every summary. | M6 fixture: one violation per rule, one error each, and the hook blocks the write in a live Claude Code session. |
| **Where the builders are building** | Docs live in Notion/Figma, agent never sees them | Everything is a terminal command in the project. `context-ds init` installs itself into Claude Code, Codex, and Cursor (skill, rules file, hooks). No browser, no separate app. | M3: fresh app, `context-ds init`, agent can run every command without further setup. |
| **Right docs at the right time, no context rot** | Whole design system dumped into context at session start | (a) Always-loaded context is one 15-line contract. (b) Per-item docs are capped at 80 lines and injected only when that item is touched: `SessionStart` injects `context-ds info`, `UserPromptSubmit` injects the docs of the template the intent resolved to, `PreToolUse` on Write/Edit injects docs for the registry items imported in that file. (c) Docs carry a version; the hook injects the version matching the installed item. (d) CI fails if any docs.md exceeds the cap. | M5: in a live session, editing a file that imports `Hero` shows the hero docs injected once, and nothing about pricing or footer. |

Two supporting outcomes from the same talk:

- **Better inputs**: `principles.md` (what Context.dev believes, what good looks like, what to refuse) and `voice.md` are first-class files the review step reads every time. "Don't just say I need a website for my Korean barbecue. Say this is what I believe in, this is what good is."
- **Stressed outputs**: `context-ds review` is the adversarial critic: "use adversarial agents to help you critique it and bang it up a little bit." A human editor still signs off; the tool does not replace that step.

## Part A: what the brand owner supplies

All of it goes in `intake/`. Brand identity (A1) may be proposed from the live site or design files; point of view (A2), behavior (A3) and voice (A4) come from the brand owner.

- **A1 Brand identity**: logos (primary, mark, mono light, mono dark), colors with roles, typography with licence and source, spacing, radius and motion.
- **A2 Point of view** (`intake/principles-answers.md`): what the product should be known for, the one buyer, three sites to be compared to and three to refuse, non-negotiables, the 3 to 5 core flows, what must never change, who signs off.
- **A3 Behavior** (`intake/behaviour.md`): per flow, steps and states (loading, empty, error, success); navigation model; data density and page width; primary and destructive actions; empty-state rule.
- **A4 Voice** (`intake/voice-answers.md`): banned words and characters, word limits, spelling, casing, five liked and five rejected lines, product naming.
- **A5 Existing material**: live site, Figma, codebase, screenshots.
- **A6 Target stack** (`intake/stack.md`): framework, Tailwind version, package manager, primitives, icons, dark mode, registry hosting, agent harnesses.
- **A7 Optional**: guidelines PDF, marketing copy, analytics, accessibility beyond WCAG AA.

## Part B: what to build

### B1. Repo layout

`package.json` (bin `context-ds`), `bin.js`, `ds.config.json`, `intake/` (read-only), `principles.md`, `voice.md`, `intents.json`, `tokens/` (DTCG), `build/` (generated), `registry.json`, `registry/{ui,blocks,templates,flows}/<name>/` (source, docs.md, example), `checks/check.config.json`, `review/rubric.md`, `public/r/` (shadcn build output), `src/` (commands, check, review, hooks, skill, schema), `test/fixtures/`.

Everything under `src/` reads brand values from `ds.config.json`, `principles.md`, `voice.md` and the registry. No brand string is hard-coded in `src/`.

### B2. Tokens

W3C DTCG JSON in three tiers: `primitive`, `semantic` (references primitive), `component` (references semantic). The build writes `build/tokens.css` and the Tailwind theme or preset. A contrast matrix covers every semantic fg/bg pair; any pair under WCAG AA fails the build and `build/contrast-report.md` records the result.

### B3. Registry: compose, don't create

Use the shadcn `registry.json` and `registry-item.json` schemas and `shadcn build`. No custom installer.

Templates are slot-based and locked. Each slot declares its allowed blocks, a default, whether it is required and a max. The template's `structure:` lists slots and `forbidden` items. The agent's decision space on a page is therefore: which allowed block goes in each optional slot, and the copy. Nothing else.

Blocks and ui carry a `docs.md` with frontmatter (`name`, `type`, `version`, `use_for`, `never`, `props`, closed `variants`, `copy_rules`, `example`) and a body of 2 to 5 sentences. Every docs.md is 80 lines max including the example, one example only. If it grows past 80 lines, split the item.

Flows encode behavior: `flows/<name>/flow.md` lists steps in order, each with its template, what the user sees, the primary action, and the four states. `context-ds docs flows/<flow>/<step>` returns that step only.

`intents.json` maps task language to a starting point by lookup (case-insensitive substring plus synonyms). No model call. If nothing matches, `resolve` says so and lists the templates.

### B4. Hooks

| Event | Hook does |
|---|---|
| `SessionStart` | Short summary: framework, token version, installed items, "run `context-ds resolve` first" |
| `UserPromptSubmit` | Runs `resolve` on the prompt; injects that template's docs, or the template index when nothing matches |
| `PreToolUse` on Write/Edit/MultiEdit | Runs `check --fast` on the proposed content; on errors, blocks the write with the list. If clean, injects docs for registry items imported in the file, once per session |
| `PostToolUse` on `add` | Injects the added item's docs |
| `Stop` | Full check; errors block completion. If pages changed, asks for `review` before handing over |
| git pre-commit, CI | The same check; CI also runs `review --threshold 7` on changed pages |

Docs versioning: `add` records the installed version in `.ds/installed.json`; hooks inject docs for the installed version; `diff` shows what is behind.

### B5. Commands

Every command supports `--json` and `--help`: `init` (idempotent), `info`, `resolve`, `scaffold` (byte-identical output for the same inputs), `docs`, `add`, `tokens`, `check` (deterministic, no model calls, `--fix` for safe fixes, `--fast` under 300ms per file), `review` (screenshots at desktop, tablet, mobile, critique against principles and rubric, scores 0 to 10 on hierarchy, coherence, brand voice, detail quality and accessibility, punch list with location and fix, non-zero exit under threshold), `diff`.

Check rules: `no-raw-color`, `no-arbitrary-spacing`, `no-off-scale-radius`, `no-off-scale-motion`, `font-family-from-tokens`, `copy-rules`, `contrast`, `template-structure`, `no-unregistered-section`, `variant-from-list`, `registry-drift`. Output: `file:line  rule-id  message  fix hint`.

### B6. Generated files

`principles.md` (belief, known for, buyer, reference screens, non-negotiables, behavior, core flows, never change, sign-off), `voice.md` (machine-readable YAML header, then prose and examples), `intents.json` (template list, flow names and synonyms).

### B7. Agent contract

Written by `init` into `CLAUDE.md`, `AGENTS.md` and `.cursor/rules/ds.mdc`, 15 lines max: resolve first, scaffold, follow the injected docs, add items instead of hand-writing them, only registry blocks as sections and only listed variants, no raw values, copy follows voice.md, check will block you, run review on new pages, overrides need a reason and a note in the summary. `SKILL.md` repeats this with a command reference and three worked examples.

## Part C: build order

M0 skeleton. M1 intake check. M2 tokens (zero AA failures). M3 core commands (init idempotent, info, resolve). M4 registry (scaffold byte-identical, docs under 80 lines). M5 hooks in a live Claude Code session. M6 check engine with one fixture per rule, `--fix`, `--fast` under 300ms, pre-commit. M7 review. M8 determinism: three fresh clones, the same prompt ("Build the pricing page for Context.dev."), identical `data-ds-block` order, zero check errors, review 7 or above, zero overrides. If structure diverges, tighten the templates and intents, never the prompt.

Versioning: semver on `context-ds`. Breaking changes to docs frontmatter, slot schema or `ds.config.json` bump the major and ship a `migrate` command.

## Part D: constraints

TypeScript, Node 20+. shadcn registry schema and CLI for installs. No MCP server in this phase. `check`, `resolve` and `scaffold` never call a model; only `review` does. Contract 15 lines, any docs injection 80 lines, enforced in CI. No em dashes. `intake/` read-only. No brand string in `src/`. Every command takes `--json` and `--help`.

## Part E: hand back

README quickstart, `build/contrast-report.md`, `test/fixtures/` with expected output, M5 evidence, M8 results (screenshots, block orders, check outputs, review scorecards, iteration count), and a list of every assumption made where intake was thin (`ASSUMPTIONS.md`).

## Status

Done and verified: M0 to M6 and M8 (see `test/evidence/`). M7 runs through the API or the local Claude Code login. Flows are not built (the flows live in the dashboard, which is out of scope for v1). The registry is not hosted and the package is not published.
