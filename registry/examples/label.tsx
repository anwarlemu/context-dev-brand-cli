import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function Product() {
  return (
    <div className="flex items-center gap-3">
      <Switch id="example-label" />
      <Label htmlFor="example-label">Email me when a monitor fires</Label>
    </div>
  );
}
