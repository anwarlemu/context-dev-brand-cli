"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const MONITORS = ["acme.com/pricing", "acme.com/docs"];

export function Product() {
  const [selected, setSelected] = useState<string | null>(null);
  const [paused, setPaused] = useState<string[]>([]);
  const isPaused = selected !== null && paused.includes(selected);
  return (
    <div className="min-h-96 w-full">
      <div className="grid max-w-xs gap-3">
        <p className="text-body-sm text-fg-muted">Select a monitor to inspect its details.</p>
        {MONITORS.map((monitor) => <Button key={monitor} variant="outline" className="justify-start" onClick={() => setSelected(monitor)}>{monitor}</Button>)}
      </div>
      <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selected}</SheetTitle>
            <SheetDescription>Checked every day at 09:00.</SheetDescription>
          </SheetHeader>
          <SheetBody className="grid content-start gap-3">
            <div className="flex items-center justify-between"><span className="text-fg-muted">Status</span><Badge variant={isPaused ? "default" : "success"}>{isPaused ? "paused" : "active"}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-fg-muted">Last change</span><span>2 days ago</span></div>
            <div className="flex items-center justify-between"><span className="text-fg-muted">Checks this month</span><span className="tabular-nums">17</span></div>
            <Button variant="outline" onClick={() => { if (selected) setPaused((all) => isPaused ? all.filter((name) => name !== selected) : [...all, selected]); }}>{isPaused ? "Resume monitor" : "Pause monitor"}</Button>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
