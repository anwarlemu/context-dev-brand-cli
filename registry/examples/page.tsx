"use client";

import { useState } from "react";
import { ExampleNameDialog } from "./demo-feedback";
import { PageColumn, PageHeader, PageRise, PageSection } from "@/components/product/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Product() {
  const [open, setOpen] = useState(false);
  const [monitors, setMonitors] = useState<string[]>([]);
  return (
    <PageColumn className="w-full">
      <PageHeader title="Monitors" description="Watch pages and get told when they change." action={<Button variant="brand" size="sm" onClick={() => setOpen(true)}>New monitor</Button>} />
      <PageSection title="Active">
        <PageRise index={0}>
          <Card className="text-body-sm text-fg-muted">{3 + monitors.length} monitors checking on schedule.</Card>
        </PageRise>
      </PageSection>
      {monitors.map((name) => <Card key={name}>{name}</Card>)}
      <ExampleNameDialog title="New monitor" open={open} onOpenChange={setOpen} onSave={(name) => setMonitors((all) => [...all, name])} submitLabel="Create" />
    </PageColumn>
  );
}
