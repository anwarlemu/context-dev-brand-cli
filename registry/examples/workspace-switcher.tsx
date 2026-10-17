"use client";

import { useState } from "react";

import { WorkspaceSwitcher } from "@/components/product/workspace-switcher";

export function Product() {
  const [ws, setWs] = useState("acme");
  return (
    <div className="w-53">
      <WorkspaceSwitcher
        value={ws}
        onValueChange={setWs}
        onCreate={() => {}}
        workspaces={[
          { id: "acme", name: "Acme", plan: "Pro" },
          { id: "personal", name: "Personal", plan: "Free" },
        ]}
      />
    </div>
  );
}
