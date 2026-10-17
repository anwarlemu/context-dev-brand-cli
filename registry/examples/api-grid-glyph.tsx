import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ApiGridGlyph } from "@/components/visuals/glyph/api-grid-glyph";

export function Product() {
  return (
    <Card className="w-full max-w-xs items-center text-center">
      <ApiGridGlyph />
      <CardTitle>Browse APIs</CardTitle>
      <CardDescription>Every Data API, ready to try in the playground.</CardDescription>
    </Card>
  );
}
