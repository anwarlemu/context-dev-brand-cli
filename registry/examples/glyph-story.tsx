import { GlyphStory } from "@/components/visuals/glyph/glyph-story";

export function Product() {
  return (
    <div className="flex items-center gap-8">
      <GlyphStory name="search" className="w-28 text-brand" />
      <GlyphStory name="search" still className="w-28 text-brand" />
    </div>
  );
}
