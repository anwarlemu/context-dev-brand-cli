import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { GlyphMelt } from "@/components/visuals/glyph/glyph-melt";

export function Product() {
  return (
    <Card data-hover-morph className="mx-auto w-full max-w-xs items-start">
      <GlyphMelt name="dataApis" className="w-16" />
      <CardTitle>Data APIs</CardTitle>
      <CardDescription>Scrape, crawl, search and enrich from one key.</CardDescription>
    </Card>
  );
}
