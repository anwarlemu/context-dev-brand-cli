import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function Product() {
  return (
    <div className="flex items-center gap-4">
      <Spinner className="text-fg-subtle" />
      <Button variant="brand" disabled>
        <Spinner className="size-3.5" /> Running
      </Button>
    </div>
  );
}
