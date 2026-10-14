---
version: 1.0.0
source: context-dashboard (markwillcraft/context-dashboard, main at c0ddf7a), its code comments and commit history; screens in intake/screens/dashboard
sign_off: ASSUMPTION Yahia Bakour (founder)
---

# Context.dev product principles

These apply to product surfaces: the dashboard, settings, the playground and anything a signed-in
user works in. They sit on top of `principles.md`: the belief (hollow web, solid context), the
logo, `#2563EB`, Rethink Sans and the voice do not change. Where this file and `principles.md`
disagree, this file wins inside the product and `principles.md` wins on marketing pages.

## What the product is for

A builder signs in to get a key, try an API, watch what their calls use and run bulk jobs. Every
screen answers one question (what did I use, which keys exist, did my batch finish) and offers the
one next action. The product is a tool used daily, so it is calm, dense and quick. Delight is for
rare moments (first run, an empty state), never for things done 100 times a day.

## Non-negotiables

- Build from `app-*` items under `.ds-product`. Pages start from an `app-*` template.
- Surfaces are the canvas (`bg-canvas`), white cards on it (`app-card`, `shadow-card`), and
  floating panels (`glass-frame`). No borders around cards: the hairline is part of the shadow.
- Squareish corners: controls 8px (`rounded-control`), small chips 6px, cards 10px, dialogs and
  menus 12px. No pills except switches and avatars.
- One brand (blue) button per page or form: the main action, with its cost when it spends credits
  ("Scrape" with "1 credit per call"). Filled black is allowed inside a card where blue would
  compete. Everything else is outline or ghost.
- Hover is a wash, not a lift: `bg-wash/4` on rows, links and icon buttons, `bg-wash/6` or `/7`
  for the selected one. Clickable cards and bordered controls get the 4px translucent brand ring.
- Type is quiet: page titles `text-h4` at weight 450, the main UI size `text-body-sm` (12.6px),
  captions 12px, tooltips and tags `text-micro`. Emphasis is color or position, never bold.
- Figures in the product are Rethink Sans with `tabular-nums`. Doto is for the credits glyph and
  dot charts only.
- Destructive actions are held, not clicked: `app-hold-button` or a hold item in `app-menu`.
- Revealing, loading or switching never shifts layout: secrets keep their masked width, skeletons
  mirror the real layout, tabs glide a pill instead of resizing.
- Light and dark themes, both AA. Tokens re-point; components never branch on the theme.

## Layout

- Shell: a 212px sidebar on the canvas, no frame around it; the page beside it scrolls. Below md
  the sidebar is a drawer from the top bar's menu button (250ms in, 200ms out).
- Page column: `page-column` (880px, nudged left beside the sidebar). Page header is centered:
  title, one muted line, then the page's single brand action if it has one.
- Rhythm: 12px between cards in a grid, 24px between a page's sections, 28px between form
  fields, 24px between fields in a dialog. Card padding is 12px to 20px by density (stat and
  chart cards 12px, settings and detail cards 20px); parameter rows hold their control 12px from
  every side, switches included.
- Pages enter with `content-in` (240ms, 4px rise); pages whose cards rise on their own only fade.
- Pages fit a laptop-height window without page scroll where they can (`fit:`, `short:`); long
  cards scroll inside with scrollbars hidden until scrolling.

## Data

- Tables sit in a card: a gray header row (`bg-neutral-10/40`) that rounds its own top corners
  so row menus can open past the card, hairlines between rows, a lighter row hover
  (`bg-neutral-5/60`, only on clickable rows), a row menu in the last cell, 10 rows a page with
  "1–10 of 248" and Previous / Next. Numbers right-aligned and tabular.
- Charts are calm: no bar borders, three date ticks (first, middle, last), soft green for success,
  amber and orange for errors, series in the fixed order blue, teal, amber, violet. The legend is a
  series menu beside the date range. One small hover card follows the pointer.
- Status reads as a colored dot and a word ("Active", "Running", "Failed"), never a filled badge.
  Compact status labels in rows are mono uppercase at `text-micro`; HTTP codes are a hairline
  pill with a dot (2xx success, 4xx alert, 5xx alert-strong).
- Money before action: a run button shows its credit cost, a batch form says what it reserves,
  a monitor form estimates its monthly credits.
- Forms: help text under each field, "Optional." at the end of the help instead of a label suffix,
  errors only after the first submit attempt, a guard against double submits.

## States

Every data view designs four states: loading (a skeleton of the real layout, 700ms typical),
empty (a fine-dot illustration, a sentence on what this is for, one brand action, optionally one
outline action such as "Read docs"), error (what failed and the retry), and populated.

## Motion

- Crisp, short, interruptible. Hover and color: 150ms ease-out. Menus and popovers: 150ms,
  scale from 0.97 at the corner nearest the trigger. Dialogs: 200ms rise and fade, centered.
  Drawers: 250ms in, 200ms out. Tab pills glide on a spring (response 0.34, damping 0.82).
- Pressed buttons scale to 0.97. Hold-to-confirm fills linearly for 1200ms, releases in 150ms.
- First visit only: overview cards rise in 50ms apart; returning skips it (`data-entered`).
- Charts draw in once per data change (line 900ms, bars 480ms). Skeleton shimmer is linear.
- Never animate keyboard-driven actions (command palette, shortcuts) or nav list swaps.
- Reduced motion keeps fades and drops movement. No interface sounds.

## Refuse

- Gradient blobs, glass blur, colored card rings, drop-shadow stacks, badges stacked on badges.
- Focus outlines from the browser; focus is the brand glass ring (`focus-visible:shadow-ring-hover`).
- Floating "Read docs" buttons, decorative dot patterns behind headers, drifting dots on buttons.
- Empty panels with no next action. Spinners where a skeleton fits. Modals for marketing.

## Copy

Sentence case everywhere, as in `voice.md`; product names and acronyms keep their capitals (Logo
Link, Data APIs, API keys). The dashboard's Title Case card titles ("Credits Used Today") are not
copied. Buttons are verb first ("Create batch", "Copy", "View plans"). Numbers are formatted
(1,343 credits), periods are short (30d), dates are "Sep 5, 2026".
