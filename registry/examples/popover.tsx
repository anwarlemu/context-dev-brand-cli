"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Product() {
  const [name, setName] = useState("Acme");
  const [draft, setDraft] = useState(name);
  const [open, setOpen] = useState(false);
  return (
    <div className="grid justify-items-start gap-3">
      <p role="status" className="text-body-sm">Workspace: {name}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild><Button variant="outline" onClick={() => setDraft(name)}>Rename</Button></PopoverTrigger>
        <PopoverContent><form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); if (!draft.trim()) return; setName(draft.trim()); setOpen(false); }}>
          <Field label="Workspace name" htmlFor="ws-name" required><Input id="ws-name" value={draft} onChange={(event) => setDraft(event.target.value)} /></Field>
          <Button type="submit" variant="primary" size="sm" disabled={!draft.trim()} className="justify-self-end">Save</Button>
        </form></PopoverContent>
      </Popover>
    </div>
  );
}
