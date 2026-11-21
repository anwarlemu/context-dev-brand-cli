# {{brand}} design system: agent instructions

Use this library to build pages and interfaces for {{brand}}. This is the design-system CLI (`{{bin}}`), not the web-data API CLI. Installing components needs no API key. Any agent that can read files or HTTP responses can use this reference; an agent with a shell can also run the CLI.

## Start by choosing the task

- **Build a new page or add a feature:** inspect existing project conventions, run `init` if the design system is not installed, find and inspect components, then `add` the ones you need. Preserve existing behavior outside the requested change.
- **Restyle an existing interface:** preview `{{cli}} apply --dry-run --json`, then run `{{cli}} apply` to convert styles. Preserve copy, links, elements, order, and screen purpose unless the user explicitly requested changes. Run the next task it prints until the work passes validation.
- **Read or plan only:** `guide`, `list`, `inspect`, and `tokens` do not change the project. Do not run the default command just to discover the library: it changes styles on its first run.

## Read before editing

1. Choose a surface. `site` is for marketing pages; `product` is for dashboards and working interfaces. Use `both` items with the appropriate surface and variant.
2. Search: `{{cli}} list "navigation" --surface product --json`. You can also filter with `--type ui`, `site`, `product`, `block`, `visual`, `hook`, or `lib`.
3. Inspect: `{{cli}} inspect sheet --json`. Read `usage`, `avoid`, `api`, `files`, `requires`, `packages`, `examples`, and `reference`. Do not guess exports, prop names, variants, or composition.
4. Install: `{{cli}} add sheet --surface product --dry-run --json`, then the same command without `--dry-run`. Dependencies and the theme are included. Existing files are kept unless you explicitly pass `--overwrite`; inspect a diff before choosing that option.
5. Read the installed source and adapt its data, callbacks, links, labels, and state to the actual application. Examples are demos with local state, not authentication, billing, API, or persistence implementations.

## Set up a project

Run from the application's root (not a monorepo's unrelated package):

```sh
npx -y {{source}} init --surface product
{{cli}} list "form" --surface product --json
{{cli}} inspect field input button --json
{{cli}} add field input button --surface product --json
```

Use `--surface site` for marketing pages. `init` installs the theme, font wiring, and agent instructions without converting existing component styles. It reports every changed file. `--dry-run --json` previews the changes. Keep existing application structure, routes, and content.

Copied React components require React 19.2 or newer and Tailwind CSS 4. The installer reads components.json and TypeScript or JavaScript alias configuration; existing aliases are preserved. The CLI reports missing requirements. Other frameworks can use the tokens and the restyling workflow, but cannot render the React components directly.

## Apply the right surface

- Wrap product UI in `<Surface kind="product">` from `@/lib/surface`. A product document uses a **15px root font size**; setting only `.ds-product` does not change rem-based spacing. Marketing documents use a **16px root on phones and 90% (14.4px at default browser settings) from 43.2rem up**. The installed site stylesheet sets this breakpoint. Use separate layouts or routes when an application has both.
- Use `<Surface kind="site">` for a marketing region. Include the installed global brand stylesheet and Tailwind theme once. Do not copy the docs site's sandboxed iframe wrapper into the application.
- Keep the provided colors, type, radii, spacing, shadows, and interaction states. Find tokens with `{{cli}} tokens <term> --json`. Reuse the component's variants before adding classes.
- Use the supplied `cn` helper. It understands the design system's custom Tailwind sizes; a generic merge function can discard required classes.
- Client components keep their `"use client"` directive. Provide stable data and real callback implementations. Do not copy demo credentials or hard-coded example account state into a production integration.

## Compose and connect

- **Product page:** `AppShell` contains navigation and the page scroller. Place `PageColumn`, `PageHeader`, and page content inside it. Page blocks demonstrate complete layouts; connect their routes and example state to the host app.
- **Marketing page:** use `SiteHeader`, `Hero`, `SiteSection`, relevant content sections, a CTA, and `SiteFooter` as the task requires. `SiteSection` supplies the column and gutters needed by ring frames and section rules. Do not place framed cards directly against the viewport edge.
- **Forms:** connect `value`/`checked` and change callbacks to state. `Field` associates a label and messages with one control. Compute and clear `error` from validation; the field itself is not a validator. Keep disabled/loading examples only when that state is real.
- **Overlays:** sheets are non-modal detail panels, so the adjacent list remains usable. Dialogs are modal and need a title, a dismissal path, and working submit/cancel handlers. Menus and popovers stay within their viewport. Use the provided portal surface so overlays inherit the correct tokens.
- **Scrolling:** a box of your own that scrolls gets `fade-y`, `fade-x` or `fade-xy` from the theme, so its content fades at the scroll edges instead of being cut off. Put the class on the scrolling element and keep any shadow, ring or background on a wrapper.
- **Navigation:** blocks emit a cancelable `ds:navigate` event before falling back to a page load. Connect it to your router, or replace example navigation with your route components. Do not ship `/preview/` links from docs examples.
- **Visuals:** reuse library glyphs and dot animations. Respect reduced motion, preserve accessible labels, and retain cleanup for animation frames, timers, listeners, and observers.
- **Examples:** `exampleFiles` contains the main example and any relative helper files it imports. These are reference code, separate from the installed component files. Install `exampleRequires` and `examplePackages` before copying an example; they may exceed the component's own dependencies.

## Verify before reporting completion

```sh
{{cli}} check --changed --json
# Run the application's own type check, tests, and production build.
{{cli}} review http://localhost:3000/your-page --any --json
```

The token check catches style values; it does not prove correct layout, accessibility, interactions, or backend integration. In a real browser test the requested page at 1440px and 390px, including keyboard navigation, focus return, open overlays, scroll edges, validation success/failure, empty/loading states, and every visible action. Compare product UI with the dashboard reference and marketing UI with context.dev. Read the reference coverage record: not every component is publicly visible on the marketing site.

`review` can use an installed reviewer or write a packet for the current agent. Follow the returned instructions and submit the completed scorecard when required. State which pages were tested, which reference was used, and whether the review was self-scored. Never treat an unavailable reviewer or a generated screenshot as a passing score.

## Files and HTTP resources

- Agent guide: {{url}}/agents.md
- Short discovery index: {{url}}/llms.txt
- Full component catalog: {{url}}/llms-full.txt
- Searchable JSON index: {{url}}/r/index.json
- Per-component Markdown: {{url}}/components/{name}.md
- Per-component metadata, API, examples, and source: {{url}}/r/{name}.json
- Tokens: {{url}}/r/theme.json
- Reference coverage and measurements: {{url}}/reference-audit.json

Prefer the bundled CLI registry for reproducible offline inspection. Hosted docs may be newer; compare the registry revision before mixing sources. `.ds/guide.md` and `AGENTS.md` keep the instructions with the project. Automatic hooks depend on the host agent and its configuration; every agent can run the explicit checks above.

## Project configuration and agent handoff

Start with `{{cli}} info --json`, then `search <term> --json` and `view <names...> --json`. These commands are read-only. `show` and `inspect` remain aliases of `view`.

`add` respects components.json, inherited TypeScript or JavaScript aliases, the target stylesheet and the package manager. It emits JSX/JS when `tsx` is false, installs the theme and agent guidance, and preserves differing local files. Use `add <names...> --diff` to review changes before `--overwrite`. Use `--cwd <app>` from a repository root. For shared workspace packages, use the upstream installer described below.

`create --template vite --name <directory>` scaffolds a new app and installs brand components. `init` configures an existing app; `init button card` also adds components. `apply --dry-run --json` previews a requested conversion of existing styles. Do not run conversion to discover or install the library.

Portable skills are installed in `.agents/skills/{{bin}}/SKILL.md` and `.claude/skills/{{bin}}/SKILL.md`; the full guide is `.ds/agent-guide.md`. Read `add --view` or the installed source for imports resolved to this project's paths. The installed brand utility is separate from the application's existing `lib/utils` exports.

The standard shadcn registry is configured under `@{{bin}}` in components.json. For workspace routing, install with `{{cli}} shadcn add @{{bin}}/theme @{{bin}}/button`. Include the theme explicitly with upstream shadcn so existing font and color aliases are updated. Native `add` applies it automatically. A selected product surface uses the product registry automatically.

Advanced operations use pinned shadcn 4.22.1: `shadcn <args...>`, `mcp`, `registry`, `preset`, `migrate`, `eject`, and `build`. These need network access on first use and preserve upstream output formats. Native brand commands accept `--json`. Preset/base changes are upstream operations that may change the brand; use them only when requested. MCP configuration alone does not prove the agent host has loaded its server.

The explicit `apply` command scopes color conversion to recognized components and preserves unrelated artwork and shared palette data. The legacy bare-command conversion remains for compatibility; use `apply` for new restyling tasks.

## Brand assets: images, social posts, decks, video and merch

Start with `{{cli}} manifest --json` (alias `describe`): every command and flag, every image template, size and palette, every slide type, reel copy flag, loop and merch item. Names outside it exit 1 with the closest match; never substitute a nearby value. Every asset command takes `--list` and `--json`, and the same inputs write the same bytes.

- `image <template>`: share images and social posts, the same templates as the brand's share-image editor. Templates `banner`, `products`, `social`, `cards`, `customer`; sizes `banner` 1500x500, `og` 1200x630, `square` 1080x1080, and with `--kind social` the shapes `16:9`, `1.91:1`, `1:1`, `4:5`, `3:4`, `9:16`, `3:1` or `--size custom --width --height`. Palettes Paper, Blue, Ink, Mist, Night, Graphite. Text by slot (`--headline`, `--body`, `--cta`, `--lists`, `--cards`, `--footer`, `--stat`, `--partner-name`). `--image <file>` turns any picture into the brand's dots; `--image-x/-y/-scale` and `--text-x/-y/-size/-width` place them as dragging does in the editor. The customer story shows a customer's logo only when `--partner <file>` is passed. PNG and SVG (`--format`, `--scale 2` for the editor's download size).
- `deck`: 1920x1080 slides (`cover`, `section`, `statement`, `bullets`, `stat`, `quote`, `image`, `closing`) from `--input deck.json` or one type with flags; a PNG per slide and `deck.pdf`.
- `video reel`: the 10 s brand reel at 1920x1080 with its copy as flags (`--headline`, `--tagline`, `--markdown`, `--quote`, `--attribution`, `--stat`, `--stat-label`, `--card`, `--url`); needs Chromium, as `review` does. `video edges|twinkle|ripple|logo --size square|vertical|landscape`: seamless dot-field loops. MP4 and WebM through ffmpeg, else PNG frames; `--still <seconds>` writes one frame.
- `merch <item>`: print files only, never mockups: `cap-front`, `tee-front`, `tee-back`, `hoodie-front`, `tote`, `mug-wrap`, `sticker` (with a CutContour die line in the SVG), `poster`, `socks`. SVG at physical size and 300 dpi PNG with bleed; `--guides` draws trim and safe lines. Only the approved logo and brand colors; confirm sizes with the vendor template.

Write copy in sentence case. Use Acme for example companies, never real people's names or third-party logos. The renderer is importable for scripts: `dist/assets/index.js` (dot shader, dot field, text layout, logo, PNG, SVG and PDF output).

## Make illustrations

`{{cli}} illustrate --list --json` lists the subjects (pictures drawn from the brand's sources, the dotted logomark, the customer burst and the website's kit artwork), palettes and presets. `{{cli}} illustrate globe --json` writes `illustration-globe.svg` (every dot a real circle, in `field`, `hollow` and `filled` groups) and a PNG; `--image <file>` shades any picture (PNG with a transparent background works best). Shader settings are flags (`--dot`, `--gap`, `--fill`, `--hollow`, `--dither`, `--render`, `--field`); colors come only from `--palette`, which reads the brand tokens. The same input, settings and `--seed` give the same bytes. Read `brand/illustration.md` (installed as part of the package) for what the brand's illustrations are: one dot size per picture, filled and hollow carrying the image, two colors, never under text. An unknown subject, palette or preset exits 1 with the nearest names; do not invent one.

## Work in Figma

The CLI does not call Figma; it writes what the Figma MCP tools need and prints the calls, in order. Keep Figma calls few: no exploratory reads.

1. **Session first.** With no target file, `whoami` (only for the plan key) then `create_new_file`. Then `create_session` with the file key before any other file tool; pass its `sessionId` on every later call.
2. **Skills before tools.** Load `figma-use` before the first `use_figma`, with `figma-generate-library` for variables and `figma-generate-design` for visible frames, and pass them in `skillNames`. Load `figma-design-to-code` before `get_design_context`.
3. **Tokens.** `{{cli}} figma tokens --json` writes `figma/tokens.json` and `figma/tokens-<n>.js`. Run each script with `use_figma`. It creates one collection with the modes Site, Product light and Product dark, or one collection per mode on a plan that allows a single mode, plus effect styles for the shadows. Rerunning updates in place.
4. **Push.** `{{cli}} figma push illustration <subject> --json` writes a `use_figma` script that draws real ellipses with paints bound to the color variables (run tokens first) and an SVG for `upload_assets`. `figma push asset <file>` (or `slide`) handles SVG and pictures through `upload_assets`; `figma push component <name>` and `figma push page <url>` write self-contained HTML for `html_to_figma`. Finish with one `get_screenshot` of the new frame.
5. **Pull and check.** `{{cli}} figma pull <url> --json` gives the read calls (`get_variable_defs`, `get_design_context`) and where to save each response; `{{cli}} figma check <files...> --json` flags every color, font, size, radius or spacing that is not a brand token, with the nearest token. Build from library components and tokens, never from the raw values.
6. **When Figma refuses a write** (a view-only seat, a plan limit, a rate limit), stop after one clear attempt and report the exact error; do not retry in a loop.
