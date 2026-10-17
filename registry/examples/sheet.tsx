"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Shown open, held inside this frame (`absolute` instead of the viewport's `fixed`) and non-modal, so the page around
// it stays usable. In an app, leave the position alone: the sheet floats over the window's right edge.
export function Product() {
  return (
    <div className="h-80">
      <Sheet defaultOpen modal={false}>
        <SheetTrigger asChild>
          <Button variant="outline">Open monitor</Button>
        </SheetTrigger>
        <SheetContent className="absolute" onOpenAutoFocus={(event) => event.preventDefault()}>
          <SheetHeader>
            <SheetTitle>acme.com/pricing</SheetTitle>
            <SheetDescription>Checked every day at 09:00.</SheetDescription>
          </SheetHeader>
          <SheetBody className="grid content-start gap-3 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">Status</span>
              <Badge variant="success">active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">Last change</span>
              <span>2 days ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">Checks this month</span>
              <span className="tabular-nums">17</span>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
