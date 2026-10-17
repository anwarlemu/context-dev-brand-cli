import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Product() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="example-prompt">Prompt</Label>
      <Textarea id="example-prompt" placeholder="Find the pricing page and list every plan." />
    </div>
  );
}
