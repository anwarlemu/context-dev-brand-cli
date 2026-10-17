import { DotGlyph } from "@/components/ui/dot-glyph";

const GEM = ["..2..", ".222.", "22222", ".222.", "..2.."];
const RINGS = ["1.1.1", ".2.2.", "1.2.1", ".2.2.", "1.1.1"];

export function Product() {
  return (
    <div className="flex items-center gap-6 text-brand">
      <DotGlyph rows={GEM} className="size-6" />
      <DotGlyph rows={RINGS} className="size-10" />
    </div>
  );
}
