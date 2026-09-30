---
name: {{name}}
description: {{brand}} design system harness. Use for any UI, page, section, landing, pricing or marketing work in this project, and whenever {{bin}} check or a hook blocks a write.
---

{{contract}}

## Commands

Every command takes `--json` and `--help`.

| Command | Use |
|---|---|
| `{{bin}} resolve "<task>"` | Task to template or flow, by lookup. No model call |
| `{{bin}} scaffold <template> [--slot s=block] [--out path] [--force]` | Write a page with default blocks in every slot. `--slot proof=none` drops an optional slot, `a+b` fills a slot with two blocks |
| `{{bin}} docs [name]` | One item's docs (80 lines max), or the index |
| `{{bin}} add <name> [--dry-run] [--diff] [--overwrite]` | Install an item with shadcn and record its version |
| `{{bin}} tokens <path> \| --search <term>` | Token value, CSS variable, Tailwind class |
| `{{bin}} check [paths] [--fix] [--fast] [--changed]` | Deterministic checks. Non-zero exit on errors |
| `{{bin}} review <url\|path> [--threshold 7]` | Screenshots plus model critique against principles.md |
| `{{bin}} diff` | Installed items behind the registry or edited by hand |
| `{{bin}} info` | Framework, tokens, installed items, hooks |

## Example 1: landing page with a testimonial as proof

```sh
{{bin}} resolve "build the landing page"        # -> templates/landing
{{bin}} scaffold landing --slot proof=testimonials
```
Then edit copy only: headline, sub, labels. Keep every slot's block. `{{bin}} check` then `{{bin}} review app/page.tsx`.

## Example 2: a product page for a new endpoint

```sh
{{bin}} resolve "product page for Monitors"     # -> templates/product
{{bin}} scaffold product --out app/monitors/page.tsx
{{bin}} docs hero                                # variants: centered, product
```
Set `variant="product"` on the hero only if the docs list it. Unknown variants fail `variant-from-list`.

## Example 3: fixing a blocked write

The hook printed:
```
app/page.tsx:12  no-raw-color  Arbitrary color `bg-[#2563EB]`  Use `bg-brand`
app/page.tsx:14  copy-rules  Banned word "seamless" in headline  ...
```
Run `{{bin}} check --fix app/page.tsx` for the safe fixes (hex to token, em dash, near-scale spacing), rewrite the copy by hand, and write again. Never silence a rule; a `// ds-override: <reason>` must be justified and reported.
