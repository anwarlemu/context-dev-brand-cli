import { GlyphTile, StillGlyph } from "@/components/visuals/glyph/glyph-tile";

export function Product() {
  return (
    <div className="flex items-center gap-4">
      <GlyphTile name="scrape" className="size-10 p-1.5" />
      <GlyphTile name="search" startsAtSeconds={0.9} className="size-10 p-1.5" />
      <GlyphTile name="parse" startsAtSeconds={1.8} className="size-10 p-1.5" />
      <GlyphTile name="crawl" still className="size-10 p-1.5" />
      <GlyphTile name="dataApis" ringed className="w-24" />
      <StillGlyph name="apiKeys" dense className="size-5 text-brand" />
    </div>
  );
}
