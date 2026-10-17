import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// On, off and disabled, each named by its label.
export function Product() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Switch id="switch-top-up" defaultChecked />
        <Label htmlFor="switch-top-up">Auto top-up</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-digest" />
        <Label htmlFor="switch-digest">Weekly usage email</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-sso" disabled />
        <Label htmlFor="switch-sso">Require SSO</Label>
      </div>
    </div>
  );
}
