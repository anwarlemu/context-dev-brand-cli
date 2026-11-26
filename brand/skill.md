---
name: {{bin}}
description: Build or restyle interfaces with the {{brand}} design system. Use when the project uses {{bin}} or the user requests {{brand}} components, tokens, or visual styling.
---

Use the project's configured components and brand tokens. Preserve the user's requested content and behavior.

Read project context with `npx {{bin}} info --json`. It reports the framework, stylesheet, aliases, installed components and registry. If the CLI is missing, use `npx -y {{source}}` in its place.

Find suitable components with `search <term> --json`, then read `view <names...> --json`. The response contains exact source and working examples. Inspect variant names, callback signatures and example dependencies instead of assuming another library's API.

Install with `add <names...> --dry-run --json`, then `add <names...> --json`. Existing local files are preserved. Use `add <names...> --diff` to compare updates; use `--overwrite` only when replacing those local changes is intended.

For new applications, `create --template vite --name <directory>` scaffolds the framework and installs the brand. Existing applications use `init`. Use `apply --dry-run` only when the user requests conversion of existing styles; package installation and restyling are different operations.

Read `guide` for brand rules and `tokens <term> --json` for custom styling. Keep colors scoped to component roles; preserve artwork, chart data and unrelated palettes. Use `check --json` and the application's build and interaction tests to verify the result.

The standard shadcn registry is `{{registry}}/r/shadcn/{name}.json`, under `@{{bin}}` in components.json. Use `npx shadcn@4.22.1 add @{{bin}}/theme @{{bin}}/<name>` for shadcn's workspace routing and ecosystem integrations. The same registry works with its MCP server. Component references are at `{{registry}}/components`.

With the upstream installer, include the theme explicitly so existing shadcn font and color aliases are updated. Native add applies it automatically.

For brand assets (share images, social posts, deck slides, the reel and dot loops, merch print files), read `npx {{bin}} manifest --json`, then run `image`, `deck`, `video` or `merch` with `--list` first. Unknown names exit 1 with the closest match; use only what the manifest lists. Only the copy you pass is drawn. To make a graphic a person will keep changing, use `design new`, then `design revise <file> "..."` or `design edit`, look at the PNG after each step, and `design undo` when needed; never edit the PNG by hand. For a layout no template has, `design new compose` and `design compose add`; for a web page from sections, `design page compose outline.json`. The guide's "I need" table names the command for each job.
For brand illustrations, run `illustrate --list --json`, then `illustrate <subject>` or `illustrate --image <file>`; colors come only from `--palette`. For Figma, the CLI writes files and prints the Figma MCP calls in order: `create_session` first, load the figma-use skill before `use_figma`, then `figma tokens`, `figma push <illustration|asset|slide|component|page>`, or `figma pull <url>` followed by `figma check <files...>`. Stop after one refused write and report the error.
