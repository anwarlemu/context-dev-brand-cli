# A6. Target stack

DETECTED from `brand-dev-webapp` (commit `22e69043`, 2026-09-30), not yet confirmed by the brand owner.

| Item | Value | Source |
|---|---|---|
| Framework | Next.js 16.3 (App Router), React 19.2 | `package.json`, running server |
| Node | 24 or later | `package.json` engines |
| Tailwind | v4.1 (`@tailwindcss/postcss`), plus a legacy `tailwind.config.ts` | `package.json` |
| Package manager | npm | `package-lock.json` |
| Primitives | Radix | `@radix-ui/*` dependencies |
| shadcn | Yes, style `new-york`, CSS variables, aliases `@/components`, `@/lib/utils` | `components.json` |
| Icons | Hugeicons Pro (stroke rounded) | `@hugeicons-pro/core-stroke-rounded` |
| Motion | `motion` 12 | `package.json` |
| Dark mode | Dashboard yes. Marketing no | `design.md` |
| Design lint | `@shadcn/lint` via `npm run lint:design` | `eslint.design.config.mjs` |
| Secrets | Doppler | `package.json` scripts |
| Registry hosting | Not decided. Default Vercel | |
| Agent harnesses | Repo has `AGENTS.md`, `.claude/`, `.cursor/`. Codex use not confirmed | repo contents |

## To confirm

- Scope of the harness: marketing and pricing pages only (the `.brand-system` scope), or the
  dashboard too. The dashboard runs a different font, blue and theme.
- Whether the harness installs into `brand-dev-webapp` itself, or only into new apps.
