import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Labels over the fields they name: a text field, a select, and a disabled field, whose label dims with it.
export function Product() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <div className="grid gap-2">
        <Label htmlFor="label-name">Key name</Label>
        <Input id="label-name" defaultValue="Production" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="label-format">Output format</Label>
        <Select defaultValue="markdown">
          <SelectTrigger id="label-format" appearance="field">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="group grid gap-2" data-disabled="true">
        <Label htmlFor="label-org">Organization ID</Label>
        <Input id="label-org" defaultValue="org_3f9a2c" disabled />
      </div>
    </div>
  );
}

export function Site() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <div className="grid gap-2">
        <Label htmlFor="label-work-email">Work email</Label>
        <Input id="label-work-email" type="email" placeholder="you@company.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="label-company">Company website</Label>
        <Input id="label-company" placeholder="https://acme.com" />
      </div>
    </div>
  );
}
