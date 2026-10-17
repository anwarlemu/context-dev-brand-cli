---
name: hero-dot-field
title: Hero dot field
type: visual
surface: site
description: "Dot-pattern hero background with optional streams, labels, logo mark, and pointer interaction."
files: [components/visuals/hero-dot-field.tsx, components/visuals/hero-dot-logo-shape.ts]
kinds: []
use_for: "A Hero's `background` (`<HeroDotField fine lively streams />` on the home page, `fine lively streams miniStreams` on a short page header, `fine solidDots={false}` for a quiet field). It clears around content marked with the pattern hole attribute, or, with none marked, around the hero's text, actions and media. Color it with a text class (text-brand/60 by default, text-white/40 on blue)."
never: [A dot field behind body text, Two dot fields in one hero, Dots in a color other than the brand blue or white]
source: src/components/sections/shared/hero-dot-field.tsx
---

The full React version of the field. `brand/dots.js` (written by the CLI) draws a lighter, still version of the stream field on any `[data-ds-dots]` hero, which the library's Hero carries; load one or the other, not both.
