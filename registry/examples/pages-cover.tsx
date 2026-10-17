import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PagesCover } from "@/components/visuals/glyph/pages-cover";

export function Product() {
  return (
    <Card data-hover-morph className="mx-auto w-full max-w-sm">
      <PagesCover className="w-full" />
      <CardTitle>Scrape anything</CardTitle>
      <CardDescription>Any page in, clean JSON out.</CardDescription>
    </Card>
  );
}
