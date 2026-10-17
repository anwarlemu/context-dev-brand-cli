import { Separator } from "@/components/ui/separator";

export function Product() {
  return (
    <div className="w-full max-w-sm text-body-sm">
      <p className="text-fg">Monitors</p>
      <p className="text-fg-muted">Watch pages for changes.</p>
      <Separator className="my-3" />
      <div className="flex h-5 items-center gap-3 text-fg-muted">
        <span>Daily</span>
        <Separator orientation="vertical" />
        <span>Weekly</span>
      </div>
    </div>
  );
}
