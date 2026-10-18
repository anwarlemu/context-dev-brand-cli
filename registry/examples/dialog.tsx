"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SecretField } from "@/components/ui/secret-field";

export function Product() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [created, setCreated] = useState("");
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button variant="brand">Create key</Button></DialogTrigger>
        <DialogContent>
          <form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; setCreated(name.trim()); setOpen(false); }}>
            <DialogHeader><DialogTitle>Create an API key</DialogTitle><DialogDescription>Keys work for every endpoint on your plan.</DialogDescription></DialogHeader>
            <DialogBody><Field label="Name" htmlFor="key-name" help="Only you see this." required><Input id="key-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Production" /></Field></DialogBody>
            <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button type="submit" variant="brand" disabled={!name.trim()}>Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {created && <div className="grid gap-2"><p role="status" className="text-body-sm">{created} key created in this example.</p><SecretField secret="ctx_example_9f2c41b7e0a84d6c" /></div>}
    </div>
  );
}
