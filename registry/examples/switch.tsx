import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function Product() {
  return (
    <div className="flex items-center gap-3">
      <Switch id="example-switch" defaultChecked />
      <Label htmlFor="example-switch">Auto top-up</Label>
    </div>
  );
}
