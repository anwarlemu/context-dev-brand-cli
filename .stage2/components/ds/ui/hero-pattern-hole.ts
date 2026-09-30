// Lives outside the pattern's client module: a server component importing a constant from a 'use client' file receives a client reference, not the string.
export const HERO_PATTERN_HOLE_ATTRIBUTE = 'data-hero-pattern-hole';

/**
 * `text` clears each rendered line, `box` the element's box, `snug-box` the box with just enough margin that no dot
 * touches it, and `tight-box` the box with only a sliver of margin (items packed close together). `cover` keeps the dots but places no solid cluster there: for opaque content that hides the
 * dots itself and moves, like a carousel's cards, so the pattern never has to re-draw around them.
 */
export type HeroPatternHole = 'text' | 'box' | 'snug-box' | 'tight-box' | 'cover';
