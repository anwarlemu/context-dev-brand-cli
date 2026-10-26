"use client";

import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// On a product page: which language the code sample shows.
export function Site() {
  return (
    <ToggleGroup type="single" defaultValue="ts" aria-label="Language">
      <ToggleGroupItem value="ts">TypeScript</ToggleGroupItem>
      <ToggleGroupItem value="py">Python</ToggleGroupItem>
      <ToggleGroupItem value="curl">cURL</ToggleGroupItem>
    </ToggleGroup>
  );
}

// On a usage chart: which APIs to show (several at once), then the outline and flush variants.
export function Product() {
  const [apis, setApis] = useState(["scrape", "search"]);
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <ToggleGroup type="multiple" value={apis} onValueChange={setApis} aria-label="APIs on the chart">
          <ToggleGroupItem value="scrape">Scrape</ToggleGroupItem>
          <ToggleGroupItem value="search">Search</ToggleGroupItem>
          <ToggleGroupItem value="crawl">Crawl</ToggleGroupItem>
          <ToggleGroupItem value="brand">Brand</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-caption text-fg-subtle">{apis.length ? `Showing ${apis.join(", ")}.` : "Pick at least one API."}</p>
      </div>
      <ToggleGroup type="single" variant="outline" defaultValue="left" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft strokeWidth={1.5} />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter strokeWidth={1.5} />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight strokeWidth={1.5} />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" size="sm" spacing={0} defaultValue="7d" aria-label="Range">
        <ToggleGroupItem value="24h">24h</ToggleGroupItem>
        <ToggleGroupItem value="7d">7d</ToggleGroupItem>
        <ToggleGroupItem value="30d">30d</ToggleGroupItem>
        <ToggleGroupItem value="90d" disabled>90d</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
