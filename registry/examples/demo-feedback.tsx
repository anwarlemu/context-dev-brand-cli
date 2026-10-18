"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ExampleMessage({ children }: { children: ReactNode }) {
  return <p role="status" className="text-body-sm text-fg-muted empty:hidden">{children}</p>;
}

export function ExampleNameDialog({ title, open, onOpenChange, initial = "", label = "Name", submitLabel = "Save", onSave }: { title: string; open: boolean; onOpenChange: (open: boolean) => void; initial?: string; label?: string; submitLabel?: string; onSave: (name: string) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><NameForm key={`${open}-${initial}`} title={title} initial={initial} label={label} submitLabel={submitLabel} onSave={(name) => { onSave(name); onOpenChange(false); }} onCancel={() => onOpenChange(false)} /></DialogContent></Dialog>;
}

function NameForm({ title, initial, label, submitLabel, onSave, onCancel }: { title: string; initial: string; label: string; submitLabel: string; onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial);
  return <form onSubmit={(event) => { event.preventDefault(); if (name.trim()) onSave(name.trim()); }}>
    <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>Changes apply to this example.</DialogDescription></DialogHeader>
    <DialogBody><Field label={label} required><Input value={name} onChange={(event) => setName(event.target.value)} /></Field></DialogBody>
    <DialogFooter><Button variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" variant="brand" disabled={!name.trim()}>{submitLabel}</Button></DialogFooter>
  </form>;
}
