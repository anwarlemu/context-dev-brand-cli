import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Product() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Rename</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Field label="Workspace name" htmlFor="ws-name">
          <Input id="ws-name" defaultValue="Acme" />
        </Field>
      </PopoverContent>
    </Popover>
  );
}
