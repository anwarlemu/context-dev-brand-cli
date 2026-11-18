import {
  Bench,
  Cover,
  CoverDark,
  MarkdownTile,
  Pipeline,
  Stat,
  Tagline,
  Testimonial,
  TwoCards,
} from "./tiles";

/* Every tile a reel can be cut from, by the name a cut refers to it by. */
export const TILES = {
  cover: Cover,
  coverDark: CoverDark,
  pipeline: Pipeline,
  stat: Stat,
  markdown: MarkdownTile,
  bench: Bench,
  twoCards: TwoCards,
  tagline: Tagline,
  testimonial: Testimonial,
} as const;
export type TileName = keyof typeof TILES;
