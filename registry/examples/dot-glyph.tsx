import { DotGlyph } from "@/components/ui/dot-glyph";

// 2 is a solid dot, 1 a ring, anything else an empty cell.
const GEM = ["..2..", ".222.", "22222", ".222.", "..2.."];
const SEARCH = ["222..", "2.2..", "222..", "...2.", "....2"];
const PAGE = ["2222.", "2..22", "2...2", "2...2", "22222"];
const CHECK = ["1111111", "1111112", "1111122", "2111221", "2212211", "1222111", "1121111"];

// The dot icon is a static SVG icon: small, inline with text, in the text's color.
export function Product() {
  return (
    <div className="flex flex-col items-start gap-5">
      <span className="flex items-center gap-1.5 text-body-sm text-fg">
        <DotGlyph rows={GEM} className="size-4 text-brand" />
        4,820 credits
      </span>
      <div className="flex flex-wrap items-center gap-4 text-body-sm text-fg-muted">
        <span className="flex items-center gap-1.5">
          <DotGlyph rows={PAGE} className="size-3 text-brand" />
          Scrape
        </span>
        <span className="flex items-center gap-1.5">
          <DotGlyph rows={SEARCH} className="size-3 text-fg/55" />
          Search
        </span>
      </div>
    </div>
  );
}

export function Site() {
  return (
    <div className="flex items-center gap-4">
      <DotGlyph rows={CHECK} className="size-12 text-fg-brand" />
      <p className="text-body text-fg">SOC 2 Type II</p>
    </div>
  );
}
