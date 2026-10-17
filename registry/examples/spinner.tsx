import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function Product() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
      <Button disabled>
        <Spinner className="text-current" /> Running
      </Button>
    </div>
  );
}
