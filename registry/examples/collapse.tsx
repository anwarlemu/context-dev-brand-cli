"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Collapse } from "@/components/ui/collapse";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function Product() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Button variant="ghost" size="sm" className="self-start" aria-expanded={open} aria-controls="advanced" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide advanced settings" : "Show advanced settings"}
      </Button>
      <Collapse open={open} id="advanced" className="flex flex-col gap-4 pt-1">
        <Field label="Timeout" htmlFor="timeout" help="Seconds before a request gives up.">
          <Input id="timeout" defaultValue="30" />
        </Field>
      </Collapse>
    </div>
  );
}
