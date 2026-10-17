"use client";

import { useState } from "react";

import { CardLink } from "@/components/product/glyph-card";
import { CreditsRemaining, CreditsUsed, UsageBarList, UsageSummaryDialog } from "@/components/product/usage-summary";
import { Button } from "@/components/ui/button";

export function Product() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <CreditsRemaining remaining={41590} total={100000} />
        <CreditsUsed today={2318} month={58410} />
      </div>
      <UsageBarList
        title="Top APIs this month"
        items={[
          { key: "scrape", label: "Scrape", value: 30410 },
          { key: "retrieve", label: "Brand retrieval", value: 15820 },
          { key: "search", label: "Search", value: 8960 },
        ]}
      />
      <Button variant="outline" size="sm" className="self-start" onClick={() => setOpen(true)}>
        Open the summary
      </Button>
      <UsageSummaryDialog open={open} onOpenChange={setOpen} description="On the Pro plan, resetting Nov 1." footer={<CardLink href="#">See full usage</CardLink>}>
        <CreditsRemaining remaining={41590} total={100000} />
      </UsageSummaryDialog>
    </div>
  );
}
