import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Product() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open monitor</Button>
      </SheetTrigger>
      <SheetContent>
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
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
