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
        <Separator orientation="vertical" />
        <span>Monthly</span>
      </div>
    </div>
  );
}

export function Site() {
  return (
    <div className="w-full max-w-md">
      <p className="text-h5 text-fg">Scrape</p>
      <p className="text-body text-fg-muted">Any page as clean Markdown.</p>
      <Separator className="my-5" />
      <p className="text-h5 text-fg">Search</p>
      <p className="text-body text-fg-muted">The web, read for you.</p>
    </div>
  );
}
