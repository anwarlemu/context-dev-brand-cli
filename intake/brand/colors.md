# Colours

Source: Context.dev Brand Guidelines, Figma page "Brand guidelines (UPDATED)", pages 15 to 18.
Read 2026-09-30 through the Figma API. Hex values are exact fills from the file.

## Core palette (guidelines page 16)

"The color palette brings together the core colors of the brand: Black, Blue and White."

| Name | HEX | RGB | HSL |
|---|---|---|---|
| Black | `#000000` | 0 / 0 / 0 | 0 / 0% / 0% |
| Blue | `#2563EB` | 37 / 99 / 235 | 221 / 83% / 53% |
| White | `#FFFFFF` | 255 / 255 / 255 | 0 / 0% / 100% |

## Neutral spectrum (page 17)

"used for text, backgrounds, and supporting UI elements". Defined in the file as black at ten
opacity steps. Hex shown is the result on white, rounded.

| Step | Opacity | On white |
|---|---|---|
| 100 | 100% | `#000000` |
| 90 | 90% | `#191919` |
| 80 | 80% | `#333333` |
| 70 | 70% | `#4D4D4D` |
| 60 | 60% | `#666666` |
| 50 | 50% | `#808080` |
| 40 | 40% | `#999999` |
| 30 | 30% | `#B2B2B2` |
| 20 | 20% | `#CCCCCC` |
| 10 | 10% | `#E6E6E6` |

## Blue spectrum (page 18)

"the brand's primary color range, from deep navy to light tints". Defined as `#2563EB` at ten
opacity steps, shown once on white (tints) and once on black (navy shades).

| Opacity | On white | On black |
|---|---|---|
| 100% | `#2563EB` | `#2563EB` |
| 90% | `#3B73ED` | `#2159D4` |
| 80% | `#5182EF` | `#1E4FBC` |
| 70% | `#6692F1` | `#1A45A4` |
| 60% | `#7CA1F3` | `#163B8D` |
| 50% | `#92B1F5` | `#123276` |
| 40% | `#A8C1F7` | `#0F285E` |
| 30% | `#BED0F9` | `#0B1E46` |
| 20% | `#D3E0FB` | `#07142F` |
| 10% | `#E9EFFD` | `#040A18` |

## Roles

Roles are NOT assigned in the guidelines. The guidelines give names and spectrums only.
Observed usage in the application designs:

| Role | Observed | Status |
|---|---|---|
| background | `#FFFFFF`, or `#2563EB` for full-bleed brand surfaces | observed |
| surface | `#F8F8F8` behind specimens in the guidelines document | observed, not named |
| text | `#000000` on white, `#FFFFFF` on blue | observed |
| brand | `#2563EB` | stated |
| accent | `#2563EB` (blue words inside a black headline) | observed |
| muted text | neutral 70 `#4D4D4D` in the website code (`brand-text-muted`) | from code, to confirm |
| light text | neutral 50 `#808080` in the website code (`brand-text-light`) | from code, to confirm |
| border | neutral 10 `#E6E6E6`, light border `#F8F8F8`, in the website code | from code, to confirm |
| card ring | blue 10 tint around white cards on the homepage | from the site |
| success, warning, danger | not in the guidelines | MISSING |

Dark mode: not covered for marketing. The dashboard has its own dark theme on a different palette
(see `intake/code/README.md`). The logo has approved versions on black.

## Conflict to resolve

The onboarding form (2026-09-26) says "grays are dangerous" and lists grays as unwanted. The
guidelines define a ten-step neutral spectrum for "text, backgrounds, and supporting UI elements".
The brand owner needs to say how far neutrals may be used in product and marketing UI.

## Contrast

- White on `#2563EB`, and `#2563EB` on white: 5.17:1. Passes AA for normal text.
- Black on white: 21:1.
