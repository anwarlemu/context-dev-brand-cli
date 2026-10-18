"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Checked, unchecked, mixed (some of a group picked) and disabled.
export function Product() {
  const [selected, setSelected] = useState(["scrape"]);
  const toggle = (name: string, checked: boolean) => setSelected((all) => checked ? [...all, name] : all.filter((value) => value !== name));
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2.5">
        <Checkbox id="cb-all" checked={selected.length === 2 ? true : selected.length ? "indeterminate" : false} onCheckedChange={(checked) => setSelected(checked ? ["scrape", "search"] : [])} />
        <Label htmlFor="cb-all">All APIs</Label>
      </div>
      <div className="grid gap-3 pl-6.5">
        <div className="flex items-center gap-2.5">
          <Checkbox id="cb-scrape" checked={selected.includes("scrape")} onCheckedChange={(checked) => toggle("scrape", checked === true)} />
          <Label htmlFor="cb-scrape">Scrape</Label>
        </div>
        <div className="flex items-center gap-2.5">
          <Checkbox id="cb-search" checked={selected.includes("search")} onCheckedChange={(checked) => toggle("search", checked === true)} />
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
