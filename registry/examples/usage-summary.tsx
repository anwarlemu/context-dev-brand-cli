"use client";

import { useState } from "react";

import { CardLink } from "@/components/product/glyph-card";
import { CreditsRemaining, CreditsUsed, UsageBarList, UsageSummaryDialog } from "@/components/product/usage-summary";
import { Button } from "@/components/ui/button";

const TOP_APIS = [
  { key: "scrape", label: "Scrape", value: 30410 },
  { key: "retrieve", label: "Brand retrieval", value: 15820 },
  { key: "search", label: "Search", value: 8960 },
];

function Summary() {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <CreditsRemaining remaining={41590} total={100000} />
        <CreditsUsed today={2318} month={58410} />
      </div>
      <UsageBarList title="Top APIs this month" items={TOP_APIS} className="mt-3" />
    </>
  );
}

// The dialog opens over the overview from the Credits remaining card. Its pieces are shown below the button as they
// sit inside it: what's left over the long dot meter, today's and this month's use, and the ranked list.
export function Product() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <Button variant="outline" size="sm" className="self-start" onClick={() => setOpen(true)}>
        Open the usage summary
      </Button>
      <div className="flex flex-col gap-3">
        <Summary />
      </div>
      <UsageSummaryDialog open={open} onOpenChange={setOpen} description="On the Pro plan, resetting Nov 1." footer={<CardLink href="#">See full usage</CardLink>}>
        <Summary />
      </UsageSummaryDialog>
    </div>
  );
}
