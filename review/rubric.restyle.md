# Review rubric: a restyled site or app

`context-ds review` uses this rubric for a project restyled with `apply`: it keeps its own copy,
elements and purpose, and only its look changed. Judge the look and the usability, never the copy
or which sections exist. Scores are 0 to 10. 7 is shippable with fixes, 9 is exemplary, 5 is generic.
The five scores keep their names; here they mean the following.

## Hierarchy (does each screen still do its job)

Say what the screen is for. Its main action is the most prominent thing on it: one filled primary
button, other actions outline or ghost. Headlines lead, supporting text is quieter, data is easy to
scan. The restyle did not bury the main action, flatten the hierarchy or make two things compete.

## Coherence (one system)

Every section uses the same few parts: the same pill buttons, card ring, radius, spacing rhythm and
type scale. Nothing is left in the old look (an old accent color, an old font, a dark panel that no
longer belongs, gray smudges where a dark-theme shadow or fade was converted). A site shows the
ruled frame; a product shows the canvas page with white cards.

## Brand voice (here: brand look)

At a glance it reads as Context.dev: white page (or the product canvas), black text, brand blue only
for accents and links, black pill primary buttons, Rethink Sans, Doto only for figures, hairline
rings instead of heavy borders and shadows, no gradients or glows from the old theme.
A site also needs the brand's moments, or it is a generic black and white page (5 at most): the
hero's field of hollow blue rings with solid diamonds, the hero visual on the blue dot panel,
screenshots and illustrations on white frames of faint rings, and the key phrase of the hero
headline and section headings in blue. Flag each one missing, and dots that cross text or crowd it.

## Detail quality (common UX errors)

Check every viewport and flag each of these as a blocker or major:
- Text touching an edge, a ruler or a card border; content without its inset on mobile.
- Headlines too big for a phone (more than about 5 lines, or words breaking), or body under 14px.
- Images, screenshots or videos drawn for the old dark theme that now sit as black holes, or fade
  from black into the white page. They need a frame (a card ring on a dark panel) or no fade.
- Translucent headers, menus or overlays that are unreadable over the content behind them.
- Spacing that collapsed or ballooned: huge empty gaps, sections jammed together, uneven padding.
  A tall stretch that is a scroll-pinned or scroll-driven section (its content sticks while the page
  scrolls) is behavior the site had before: note it, do not ask to remove it.
- Misaligned columns, a stray bullet or divider, clipped or overlapping elements, horizontal scroll.
- Lines of body text wider than about 75 characters.

## Accessibility

Text contrast at least 4.5:1 (3:1 for large text and icons), including text over images and on
colored buttons. Touch targets at least 44px on mobile. Focus is visible on every link and button.
States (hover, active, selected, disabled) are distinguishable without color alone.
