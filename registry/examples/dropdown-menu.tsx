"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuHoldItem, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExampleMessage, ExampleNameDialog } from "./demo-feedback";

export function Product() {
  const [keys, setKeys] = useState([{ id: "production", name: "Production key" }]);
  const [editing, setEditing] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  return <div className="grid w-full max-w-md gap-3">
    {keys.map(({ name, id }, index) => <div key={id} className="flex items-center justify-between rounded-card bg-surface py-2 pr-2 pl-4 text-body-sm text-fg shadow-card">
      {name}
      <DropdownMenu modal={false}><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${name}`}><MoreVertical strokeWidth={1.5} /></Button></DropdownMenuTrigger>
        <DropdownMenuContent><DropdownMenuLabel>{name}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setEditing(index)}><Pencil strokeWidth={1.5} />Rename</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { setKeys((all) => [...all, { id: crypto.randomUUID(), name: `${name} copy` }]); setMessage("Key duplicated."); }}><Copy strokeWidth={1.5} />Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuHoldItem onConfirm={() => { setKeys((all) => all.filter((_, i) => i !== index)); setMessage(`${name} deleted.`); }}><Trash2 strokeWidth={1.5} />Delete</DropdownMenuHoldItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>)}
    <ExampleMessage>{message}</ExampleMessage>
    {!keys.length && <Button variant="outline" onClick={() => { setKeys([{ id: "production", name: "Production key" }]); setMessage(""); }}>Reset example</Button>}
    <ExampleNameDialog title="Rename key" open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }} initial={editing === null ? "" : keys[editing]?.name} onSave={(name) => { setKeys((all) => all.map((key, i) => i === editing ? { ...key, name } : key)); setMessage("Key renamed."); }} />
  </div>;
}
