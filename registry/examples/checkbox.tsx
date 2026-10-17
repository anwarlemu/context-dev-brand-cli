import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Checked, unchecked, mixed (some of a group picked) and disabled.
export function Product() {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2.5">
        <Checkbox id="cb-all" checked="indeterminate" />
        <Label htmlFor="cb-all">All APIs</Label>
      </div>
      <div className="grid gap-3 pl-6.5">
        <div className="flex items-center gap-2.5">
          <Checkbox id="cb-scrape" defaultChecked />
          <Label htmlFor="cb-scrape">Scrape</Label>
        </div>
        <div className="flex items-center gap-2.5">
          <Checkbox id="cb-search" />
          <Label htmlFor="cb-search">Search</Label>
        </div>
        <div className="flex items-center gap-2.5">
          <Checkbox id="cb-crawl" disabled />
          <Label htmlFor="cb-crawl">Crawl (on Pro)</Label>
        </div>
      </div>
    </div>
  );
}
