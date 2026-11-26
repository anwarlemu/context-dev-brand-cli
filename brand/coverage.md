# What the CLI makes

Every kind of graphic, page and file, how it is made, where it is tested, and what is not made because the brand has no
source for it. Derived kinds are built only from the tokens and the brand's existing parts.

| Kind | How | Test |
|---|---|---|
| Link previews, posts and stories (og, square, portrait, tall, story, landscape, LinkedIn, Facebook and Threads posts) | `image <template> --size ...` | test/design/adapter.test.ts (every template x size, short and long copy) |
| Headers and covers (X, LinkedIn profile and page, YouTube channel art, Facebook cover, Pinterest, email) | `image <template> --size ...`, safe areas from src/design/platforms.ts | same |
| YouTube thumbnail, profile pictures | `image <template> --size youtube-thumbnail`, `image mark --size avatar` | same |
| Carousels | `image --input carousel.json` | test/assets.test.ts |
| Display ads (300x250, 336x280, 728x90, 300x600, 320x50, 160x600, 970x250) | `image ad --size ad-...` | adapter.test.ts (recipes as templates) |
| Quote, stat, launch, feature, comparison, pricing, event and hiring cards; framed screenshot; before and after | `image <card>` (src/assets/recipes.ts) | same |
| Charts and diagrams | compose `chart` block (bar, line, donut), `deck chart`; diagrams from cards and dividers in compose | same |
| One-pager, report cover, letterhead, certificate, business card, name tag, event badge, email header and signature | `image <recipe> --size a4/letter/...`, `-f pdf` | same |
| Any layout no template has | `design new compose`, `design compose add ...` | conformance (every block, every template rebuilt as blocks) |
| Slides (cover, section, statement, bullets, stat, quote, image, closing, agenda, team, timeline, chart, comparison, image grid, questions) | `deck` | adapter.test.ts, test/assets.test.ts |
| The reel, dot loops | `video` | test/design/media.test.ts, test/assets.test.ts |
| Reveal of any design, intro and outro stings, lower third, walkthrough, animated stat (a stat card revealed) | `motion` | test/motion.test.ts |
| Favicons, app icons, maskable icon, manifest entry | `icons` | fresh-install run |
| Video-call backgrounds, desktop and phone wallpapers | `image background --size meeting/desktop/phone-wallpaper` | adapter.test.ts |
| Merch (cap, tee, hoodie, tote, mug, sticker, sticker sheet, posters 11x17, 18x24, 24x36, notebook, lanyard, socks) | `merch` | test/design/media.test.ts (safe area, nothing unasked) |
| Illustrations | `illustrate` | test/illustrate-figma.test.ts |
| Emails (newsletter, announcement, receipt, password reset) | `email` (derived: brand/assets/email.md) | test/email.test.ts |
| Pages: home sections, product, pricing, blog index and post, customer story, contact, legal, 404, 500 (derived), login, signup, verify email, careers (derived), newsletter (derived) | library items, `add` | registry checks, CI |
| A whole page from an outline | `design page compose outline.json` (React and plain HTML) | test/design/page.test.ts |

Not made, because the brand has no source: an about page and a changelog page (the website has neither), product
photography, people's photos, and third-party logos. Brand icons beyond the dot glyphs and the mark: the site draws
lucide icons, which are not the brand's own, so none ship as brand files.
