# Context.dev illustrations

What the brand's illustrations are, as its own sources draw them. Each rule names where it comes from; nothing here
goes beyond them. `illustrate` follows these rules, and `brand/illustrate.json` holds its palettes, presets and
subjects.

Sources: **principles** = `brand/principles.md`; **shader tool** = agd-playground `public/context-image-shader/shader.js`;
**share editor** = agd-playground `src/components/context-og/` (`draw.ts`, `shader.ts`, `Playground.tsx`); **reel** =
agd-playground `src/components/context-reel/tiles.tsx`; **film** = context-dev-video `src/` (`DotField.tsx`, `mark.tsx`,
`scenes/`); **kit** = the website's image dot shader (`registry/components/visuals/image-dot-shader.ts`, from the brand
kit's blog-cover shader) and its brand page samples (`brand/illustrations/*.svg`); **dots** = `brand/dots.js`, the site's
hero stream field; **reference** = `brand/reference/site-*.jpg`.

## The idea

1. **A picture is a field of dots in three states: filled, hollow or empty.** Hollow circles are the open web, solid
   circles are context. (principles, "The idea"; shader tool header; kit `DOT_ABSENT | DOT_HOLLOW | DOT_FILLED`)
2. **Every dot in a shaded picture has the same size and pitch; only its state carries the image,** so a solid object
   never becomes a solid block. (shader tool header comment; share editor `shader.ts` header)
3. **The subject is cut out of its background first,** and the picture's own frame is never drawn as a contour.
   (shader tool `buildCutout` and `sample`; kit `keyOutOpaqueBackdrop`)

## The grid

4. **Whole dots on a square grid, centered in the frame.** (shader tool `geom`; share editor `grid`)
5. **The dot is about a third of the pitch in radius:** 3.4 of 10 in the kit, 0.32 of the pitch in the film and the
   site's hero field, 6 dots with 3 gaps (radius 0.33 of the pitch) as the shader tool opens. (kit `SHADER_DOT_RADIUS`;
   film `DotField radiusRatio`; dots `DOT_RADIUS_RATIO`; shader tool `DEF`)
6. **A hollow dot is a thin ring with the filled dot's outer edge:** 1.2px in the shader tool and share editor, 1.6px
   at the kit's 10px pitch, 2px at the film's 24px pitch. (shader tool `ring`; share editor `RING`; kit
   `SHADER_RING_STROKE`; film `Identity`)

## Color

7. **Two colors per picture: a ground and one dot color, from the brand's three surfaces.** White with brand blue
   dots, blue with white dots, black with white or blue dots. (kit `DOT_SHADER_SURFACES`; share editor `PALETTES`;
   principles "white, blue or black")
8. **Never the picture in its own colors next to its dots.** (kit library entry `dot-shader-image`, "never")
9. **The backdrop is quiet:** none, a faint grid of full dots (opacity 0.3 to 0.4), a faint ring grid (0.14 on white,
   0.22 on blue or black), or a neutral dot. The kit's rings clear away from the art. (share editor `field`; shader tool
   presets "faint grid"; kit `backdropRings` and its halo)

## Subjects and moments

10. **Simple, recognizable subjects drawn as light:** a globe, a sphere, a cursor, stacked layers, a key. (share
    editor and shader tool `SAMPLES`)
11. **The logomark in dots: the disc and the square lit, the hole as rings,** on a dim field. (film `mark.tsx`
    `markKindAt`, from the dashboard's `hero-dot-logo-shape.ts`; film `Identity`)
12. **The brand page's own artwork** (extract, integration, logomark, orbit, pages) is kit output: draw beside it
    with the kit settings. (kit samples)
13. **A burst for a customer story:** rings of dots growing outward, lit from below, hollow where dim. The one place
    dots change size. (share editor `drawBurst`)
14. **Dots support content and never sit under words.** (principles "The idea"; share editor `covered`, "No dot ever
    sits under the words"; dots, clearing around text)
15. **As a texture, dots gather at the edges and thin toward the content,** never across a whole section. (dots
    streams; film `EdgeDots` and `Stat`; principles "Restraint"; reference site heroes)
16. **A figure is set in Doto,** the face made of dots, not drawn dot by dot. (principles "Doto only for a figure";
    film `Stat`, Doto 700 in blue on black; tokens `--ds-font-data`)

## Motion (when a picture moves)

17. **Dots fade in once and rest still;** a field breathes in, then the subject lights from its center out, on an
    ease-out curve, never ease-in. Reduced motion shows the still. (dots "fades in once and then rests still"; film
    `Identity` and `theme.ts` `OUT`; principles "Always") `illustrate` writes stills.

## Not the brand

Gradients, glows or glass behind dots; dots in several sizes inside one shaded picture; a different dot style per
section; the source photo shown beside its dots; third-party logos or real people in examples. (principles; kit
"never")

## Where the playground and the tokens disagree

`brand/tokens.css` wins. The share editor's Night (#0b1220, #dbe6ff, #7f9fe8), Graphite (#161616, #0a6cff) and the
shader tool's Inverse (#0b0f1c on blue) use colors outside the tokens and are not offered. Fields map to the nearest
token: Ink #2e2e2e and Mono #3a3a3a to neutral-80, Mist #eeeeee and #cfd0d6 to bg-frame and neutral-20, the shader
tool's Paper field #bccbf7 to blue-30 (offered as `tint`, since the share editor's Paper is a brand field at 0.35). The
customer post sets its stat as bold Rethink Sans in dots; the tokens set figures in Doto, so figures stay type.
