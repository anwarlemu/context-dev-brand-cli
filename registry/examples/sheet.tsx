import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Product() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open monitor</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>acme.com/pricing</SheetTitle>
          <SheetDescription>Checked every day at 09:00.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 p-5 text-body-sm">
          <div className="flex items-center justify-between">
            <span className="text-fg-muted">Status</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-fg-muted">Last change</span>
            <span>2 days ago</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
