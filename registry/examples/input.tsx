import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Product() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="example-url">Website</Label>
      <Input id="example-url" placeholder="https://acme.com" />
    </div>
  );
}
