import { ArrowRight, MoreVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Product() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="brand">
          <Plus /> New monitor
        </Button>
        <Button variant="primary">Save</Button>
        <Button>Cancel</Button>
        <Button variant="outline-brand">Upgrade</Button>
        <Button variant="ghost">Skip</Button>
        <Button variant="ghost" size="icon" aria-label="Row actions">
          <MoreVertical strokeWidth={1.5} />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="brand" size="sm">
          <Plus /> Create key
        </Button>
        <Button size="sm">Export</Button>
        <Button variant="ghost" size="sm">
          Clear
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-card bg-brand p-4">
        <Button variant="on-brand">Talk to us</Button>
      </div>
    </div>
  );
}

export function Site() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="pill">Start for free</Button>
      <Button variant="pill-outline">
        Read the docs <ArrowRight />
      </Button>
      <Button variant="pill-outline" size="sm">
        Explore
      </Button>
      <div className="rounded-card bg-brand p-4">
        <Button variant="pill-on-brand">Book a demo</Button>
      </div>
    </div>
  );
}
