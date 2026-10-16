# context-ds (working on the harness itself)

This repo is the CLI that applies the Context.dev design system to any project and keeps agents on it. `README.md`
says how it is used. Apps that install it get a different contract, written from `brand/contract.md`.

## Loop

```sh
npm install          # also builds (prepare)
npm run build        # tsc, then scripts/build-brand.mjs (brand/ -> build/)
npm run ci           # build, limits, tests; must pass before you push
```

## Where things are

- `brand/`: the only brand-specific content. `tokens.css` is the single source of values (site at `:root`, product
  under `.ds-product`, product dark). `site.css` and `product.css` are the base layers. `elements.json` holds how each
  kind of element is styled (site and product), with `match` data for detection and a `source` in the brand's code.
  `reference/` holds the brand's own pages as screenshots (used by `review`). `brand.json` holds names and the source.
- References for the look: the site is brand-dev-webapp's branch `agencidev/redesign-dashboard-and-website` (read it
  with `git show` or a `git archive` copy; the local checkout lags behind); the product is the context-dashboard repo.
  When the brand changes, re-measure there (computed styles), update `brand/`, and recapture `brand/reference/`.
- `src/project/`: stack detection, main stylesheet and layouts, site or product, screens and the files each is drawn from.
- `src/convert/`: converts style values by role in every file type (CSS, templates, scripts, Tailwind, native).
- `src/install/`: the brand stylesheet and fonts, the dots script, contract, hooks (Claude Code, Codex, Cursor), pre-commit.
- `src/plan/`: the task queue (`state.json` in the app), element detection and `look` output.
- `src/check/`: the value check (rules.ts), used by hooks, pre-commit and `check`.
- `src/review/`, `src/hooks/`, `src/commands/`.

## Rules

- No brand strings in `src/` (read `brand/brand.json`); `scripts/ci-limits.mjs` enforces it.
- No em dashes; American spelling; sentence case.
- Element styles use only brand tokens and follow the animation rules (no ease-in, no `transition: all`, 150 to 300ms);
  the tests check every value.
- Restyle only: nothing the CLI writes may change a project's copy, elements or structure. The only markup it asks for
  is `data-ds-dots` on the home hero and `ds-accent` spans around existing words.
- Apps install from `main`, and every push to it is a release. Push only with `npm run ci` green.
- Test changes on real projects (copies in a scratch folder, never the originals): a site, a product, a plain HTML site,
  a dark site, a Tailwind app and a native sample.

## Do not

- Kill processes by pattern (`pkill -f "next dev"`): the owner's brand-dev-webapp dev server runs on :3000.
- Modify `~/Desktop/TRIAGE/Work/Agencidev/brand-dev-webapp` or context-dashboard.
- Commit `build`, `dist` or `node_modules`.
