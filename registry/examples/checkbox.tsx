import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function Product() {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2.5">
        <Checkbox id="cb-1" defaultChecked />
        <Label htmlFor="cb-1">Scrape</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox id="cb-2" />
        <Label htmlFor="cb-2">Search</Label>
      </div>
    </div>
  );
}
