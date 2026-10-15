# {{brand}} design system
- This project is not React with Tailwind 4, so the registry's components and templates do not apply. Build with the project's own components and markup.
- Brand values are CSS variables, `var(--ds-*)`. Find one with `{{bin}} tokens --search <term>` or `{{bin}} tokens <path>`.
- No raw color, spacing, radius, font, or motion values in new or changed styles. Use the tokens.
- Rethink Sans is the typeface (`var(--ds-font-sans)`). Doto (`var(--ds-font-data)`) is only for figures, never for words.
- Copy follows voice.md. Word limits apply to headlines, subheads, buttons.
- To apply the brand to the existing site, run `{{bin}} apply`, then fix every file it lists. It changes how the site looks: only when the user asks.
- `{{bin}} check` runs automatically and will block you. Fix every error, do not work around it.
- A `ds-override: <reason>` comment only counts once the user approves it with `{{bin}} approve` in their terminal. You cannot approve it; prefer fixing the finding.
