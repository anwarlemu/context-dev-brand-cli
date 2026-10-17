"use client";

import { useState } from "react";

import { WorkspaceSwitcher } from "@/components/product/workspace-switcher";

export function Product() {
  const [ws, setWs] = useState("acme");
  const [def, setDef] = useState("acme");
  return (
    <div className="w-53">
      <WorkspaceSwitcher
        value={ws}
        defaultId={def}
        onValueChange={setWs}
        onMakeDefault={setDef}
        onOpenSettings={() => {}}
        onCreate={() => {}}
        workspaces={[
          { id: "acme", name: "Acme", plan: "Pro" },
          { id: "personal", name: "Personal", plan: "Free" },
          { id: "labs", name: "Acme Labs", plan: "Starter" },
        ]}
      />
    </div>
  );
}
