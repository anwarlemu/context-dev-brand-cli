"use client";

import { useState } from "react";

import { GlideTabs } from "@/components/product/glide-tabs";

export function Product() {
  const [range, setRange] = useState("30");
  const [api, setApi] = useState("scrape");
  return (
    <div className="flex flex-col items-start gap-4">
      <GlideTabs
        label="Date range"
        value={range}
        onValueChange={setRange}
        options={[
          { value: "7", label: "Last 7 days" },
          { value: "30", label: "Last 30 days" },
          { value: "90", label: "Last 3 months" },
        ]}
      />
      <GlideTabs
        label="API"
        role="tab"
        appearance="track"
        value={api}
        onValueChange={setApi}
        options={[
          { value: "scrape", label: "Scrape" },
          { value: "search", label: "Search" },
          { value: "crawl", label: "Crawl" },
          { value: "answers", label: "Answers" },
        ]}
      />
    </div>
  );
}
