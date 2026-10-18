"use client";

import { useState } from "react";
import { WorkspaceSwitcher } from "@/components/product/workspace-switcher";
import { ExampleMessage, ExampleNameDialog } from "./demo-feedback";

export function Product() {
  const [ws, setWs] = useState("acme");
  const [def, setDef] = useState("acme");
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [workspaces, setWorkspaces] = useState([{ id: "acme", name: "Acme", plan: "Pro" }, { id: "personal", name: "Personal", plan: "Free" }, { id: "labs", name: "Acme Labs", plan: "Starter" }]);
  return <div className="grid w-64 gap-4">
    <WorkspaceSwitcher value={ws} defaultId={def} onValueChange={setWs} onMakeDefault={setDef} onOpenSettings={setEditing} onCreate={() => setEditing("new")} workspaces={workspaces} />
    <ExampleMessage>{message}</ExampleMessage>
    <ExampleNameDialog title={editing === "new" ? "Create organization" : "Organization settings"} open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }} initial={workspaces.find((w) => w.id === editing)?.name} onSave={(name) => {
      if (editing === "new") { const id = `workspace-${workspaces.length}`; setWorkspaces((all) => [...all, { id, name, plan: "Free" }]); setWs(id); setMessage(`${name} created.`); }
      else { setWorkspaces((all) => all.map((w) => w.id === editing ? { ...w, name } : w)); setMessage("Organization name saved."); }
    }} />
  </div>;
}
