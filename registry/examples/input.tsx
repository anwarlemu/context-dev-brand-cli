import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Empty with a placeholder, filled, invalid and disabled.
export function Product() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="input-url">Website</Label>
        <Input id="input-url" placeholder="https://acme.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="input-name">Key name</Label>
        <Input id="input-name" defaultValue="Production" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="input-email">Email</Label>
        <Input id="input-email" defaultValue="anwar@" aria-invalid />
      </div>
      <div className="group grid gap-2" data-disabled="true">
        <Label htmlFor="input-org">Organization ID</Label>
        <Input id="input-org" defaultValue="org_3f9a2c" disabled />
      </div>
    </div>
  );
}

export function Site() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="input-work-email">Work email</Label>
      <Input id="input-work-email" type="email" placeholder="you@company.com" />
    </div>
  );
}
