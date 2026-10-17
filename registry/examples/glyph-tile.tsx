import { GlyphTile, StillGlyph } from "@/components/visuals/glyph/glyph-tile";

// Small tiles as card and list icons (staggered so they never loop in step), one held still, and the bare StillGlyph.
// `ringed` (last) draws the large fine-dot glyph instead of a tile.
export function Product() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <GlyphTile name="scrape" className="size-10 p-1.5" />
      <GlyphTile name="search" startsAtSeconds={0.9} className="size-10 p-1.5" />
      <GlyphTile name="parse" startsAtSeconds={1.8} className="size-10 p-1.5" />
      <GlyphTile name="crawl" still className="size-10 p-1.5" />
      <StillGlyph name="apiKeys" dense className="size-5 text-brand" />
      <span aria-hidden className="mx-2 h-10 w-px bg-hairline" />
      <GlyphTile name="dataApis" ringed className="w-16" />
    </div>
  );
}
