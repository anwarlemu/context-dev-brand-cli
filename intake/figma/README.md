# Figma export

File: https://www.figma.com/design/JBV3nPwUDzQ3HWnlXQ5GqN/Context.dev--EXT---Copy-
Read 2026-09-30, first through the Figma MCP connector, then through the REST API.

## Pages in the file

| Page | Read | Where |
|---|---|---|
| Visual identity (UPDATED) | Yes, 9 frames rendered | `identity-preview/` |
| Brand guidelines (UPDATED), 34 pages | Yes, all text and all pages rendered at half size | `guidelines/page-01.png` to `page-34.png`, `guidelines/text.txt` |
| Brand Assets (UPDATED) | Structure and text read. Logos and patterns exported as SVG | `../brand/logo/`, `../brand/pattern/` |
| Brand identity slideshow (UPDATED), 16 pages | Text only. Nothing new beyond the guidelines | not exported |
| Cover, 1. Moodboards, 2. Brand identity Concepts | Not read | |
| 3. Brand identity - final, 4. Brand guidelines, 6. Brand assets, 7. Brand identity slideshow | Not read. Earlier versions of the UPDATED pages | |

Not exported: renders of the application designs on the Brand Assets page (12 feature announcement
posts, 11 ad designs, 4 social banners, 4 imagery samples). Figma's image export returned HTTP 429
with a retry-after of about 4.6 days on this token. Their text and layout values were read.

The file has no Figma variables, colour styles or components.

## Identity preview frames

| File | Shows |
|---|---|
| `01-frame-189.png` | App icon on a phone home screen |
| `02-frame-181.png` | Three square social cards |
| `03-frame-179.png` | "Paste one line." agent setup card |
| `04-frame-182.png` | Tagline on white with the pattern |
| `05-frame-180.png` | Logo on blue with the pattern |
| `06-frame-178.png` | Two portrait cards |
| `07-frame-183.png` | Palette |
| `08-frame-165.png` | Cap mockup |
| `09-frame-188.png` | "94%" stat in Doto with a 10x10 dot chart |

## Copy in the application designs

Headlines:

- "Web data API for AI Agents"
- "Paste one line. Your agent sets up Context.dev itself."
- "Give your agent the web data it needs to finish a task."
- "Accurate data for your agent's next step"
- "One API gives your agent the whole web as context"
- "Scrape any page from one dashboard."
- "Monitors, for watching any webpage for changes."
- "Enrich any person with data from across the web."
- "Extract any website's colors, fonts and spacing."
- "94% of pages returned as clean, usable content"

Labels above a headline: "New:", "New Feature:", "NEW", "NEW!" (four variants are shown).

Body:

- "Agents decide what to do at every step. Context.dev gives them clean, sourced web data, so each
  decision is accurate and the agent stays on course."
- "Signup for an account & get API key with context.dev/auth.md, then follow
  docs.context.dev/agent-quickstart to integrate into the codebase"

Buttons: "Start for free" (9 uses), "Try it on Context.dev" (6), "Add Context.dev to your agent" (2),
"Sign up today", "copy".
