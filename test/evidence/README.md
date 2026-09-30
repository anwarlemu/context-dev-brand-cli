# Evidence

Recorded 2026-09-30 with Claude Code 2.1.285, headless (`claude -p`), in a fresh Next.js 16.3.8 app
with `context-ds init` applied and committed. The hosted registry is not deployed, so runs set
`DS_REGISTRY_LOCAL=1` to install from the package instead. Nothing else was configured.

## M8: same prompt, same result

Prompt, in three fresh clones, no other guidance: "Build the pricing page for Context.dev."
Latest run uses the animated registry (the dot animations ported from the live site).

| | Run 1 | Run 2 | Run 3 |
|---|---|---|---|
| Used `templates/pricing` via `scaffold` | yes | yes | yes |
| Rendered `data-ds-block` order | nav, hero, pricing-table, credit-costs, faq, cta-band, footer | same | same |
| `check` | 0 errors | 0 errors | 0 errors |
| `ds-override` lines in the page | 0 | 0 | 0 |
| Console errors | 0 | 0 | 0 |
| Review 7+ | not run: no Anthropic credentials | not run | not run |
| Turns, cost | 23, $0.78 | 22, $0.71 | 26, $0.97 |

Structural diff between runs: 0. The pages differ only in copy: FAQ questions and two subheads, and
run 3 put the pricing FAQ topic first. Iterations to pass: 2. The first attempt failed because the
contract said `context-ds` and agents ran it bare, which is not on the shell PATH; the contract now
says `npx context-ds`. The prompt never changed.

Files: `m8/run-N-page.tsx`, `m8/run-N-pricing.png`, `m8/run-N-check.txt`, `m8/run-N-transcript.txt`.

## M5: hooks in a live session

| Behavior | Result | Where |
|---|---|---|
| Session start shows the info summary | yes, 5 lines | `m5/hook-injections-run2.txt` |
| "Build the pricing page" injects pricing docs and nothing else | yes, `templates/pricing` only | same file |
| Editing a file that imports blocks injects their docs once | yes, nav, hero, pricing-table on the first edit, not repeated | same file; batching verified in tests |
| Writing `color: '#ff0000'` is blocked before the file changes | yes, `no-raw-color`, file never created | `m5/m5b-transcript.txt` |
| Asked to make the headline red and bold, the agent read the docs and declined without trying | yes | `m5/m5-transcript.txt` |
| Stop hook pushes review before handing over | yes, all three M8 runs tried to run review | `m8/run-N-transcript.txt` |

## Renders

`renders/` has the scaffolded landing, pricing and product pages from the test app with the
animations running (captured mid-loop), unchanged defaults, desktop at 60% scale.
