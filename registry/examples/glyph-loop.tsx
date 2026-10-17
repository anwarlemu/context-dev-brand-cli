import { GlyphLoop } from "@/components/visuals/glyph/glyph-loop";

export function Product() {
  return (
    <div className="flex items-center justify-center gap-6">
      <GlyphLoop name="monitors" className="w-16 text-brand" />
      <GlyphLoop name="usage" startsAtSeconds={1.2} className="w-16 text-brand" />
      <GlyphLoop name="team" startsAtSeconds={2.4} className="w-16 text-brand" />
    </div>
  );
}
