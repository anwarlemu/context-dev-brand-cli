import { ArrowRight, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Product() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>
        <Plus /> New monitor
      </Button>
      <Button variant="black">Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="destructive">
        <Trash2 /> Delete
      </Button>
      <Button variant="ghost" size="icon" aria-label="Add">
        <Plus />
      </Button>
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
      <div className="rounded-card bg-brand p-4">
        <Button variant="pill-on-brand">Book a demo</Button>
      </div>
    </div>
  );
}
