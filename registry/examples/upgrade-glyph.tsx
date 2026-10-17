import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { UpgradeGlyph } from "@/components/visuals/glyph/upgrade-glyph";

export function Product() {
  return (
    <Card className="mx-auto w-full max-w-xs items-start">
      <UpgradeGlyph className="w-24 text-brand" />
      <CardTitle>Upgrade plan</CardTitle>
      <CardDescription>More credits and higher rate limits.</CardDescription>
    </Card>
  );
}
