"use client";

import { useState } from "react";
import { ArrowRight, MoreVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Product() {
  const [message, setMessage] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="brand" onClick={() => setMessage("New monitor selected.")}>
          <Plus /> New monitor
        </Button>
        <Button variant="primary" onClick={() => setMessage("Changes saved.")}>Save</Button>
        <Button onClick={() => setMessage("Changes cancelled.")}>Cancel</Button>
        <Button variant="outline-brand" onClick={() => setMessage("Upgrade selected.")}>Upgrade</Button>
        <Button variant="ghost" onClick={() => setMessage("Step skipped.")}>Skip</Button>
        <Button variant="ghost" size="icon" aria-label="Row actions" onClick={() => setMessage("Row actions selected.")}>
          <MoreVertical strokeWidth={1.5} />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="brand" size="sm" onClick={() => setMessage("Create key selected.")}>
          <Plus /> Create key
        </Button>
        <Button size="sm" onClick={() => { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob(["name,status\nProduction,active\n"], { type: "text/csv" })); link.download = "example.csv"; link.click(); URL.revokeObjectURL(link.href); setMessage("Example exported."); }}>Export</Button>
        <Button variant="ghost" size="sm" onClick={() => setMessage("")}>
          Clear
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-card bg-brand p-4">
        <Button variant="on-brand" asChild><a href="mailto:hello@context.dev">Talk to us</a></Button>
      </div>
      <p role="status" className="text-body-sm text-fg-muted empty:hidden">{message}</p>
    </div>
  );
}

export function Site() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="pill" asChild><a href="https://context.dev/signup" target="_blank" rel="noreferrer">Start for free</a></Button>
      <Button variant="pill-outline" asChild><a href="https://docs.context.dev" target="_blank" rel="noreferrer">Read the docs <ArrowRight /></a></Button>
      <Button variant="pill-outline" size="sm" asChild><a href="https://context.dev" target="_blank" rel="noreferrer">Explore</a></Button>
      <div className="rounded-card bg-brand p-4">
        <Button variant="pill-on-brand" asChild><a href="https://cal.com/context-dev/30min" target="_blank" rel="noreferrer">Book a demo</a></Button>
      </div>
    </div>
  );
}
