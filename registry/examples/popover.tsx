"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Shown open: a small form anchored to the control that opens it. Focus stays on the page until you reach in.
export function Product() {
  return (
    <div className="h-44">
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="outline">Rename</Button>
        </PopoverTrigger>
        <PopoverContent onOpenAutoFocus={(event) => event.preventDefault()} className="grid gap-3">
          <Field label="Workspace name" htmlFor="ws-name">
            <Input id="ws-name" defaultValue="Acme" />
          </Field>
          <Button variant="primary" size="sm" className="justify-self-end">
            Save
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
