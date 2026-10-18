"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditsMenu } from "@/components/product/credits-menu";

export function Product() {
  const [autoTopUp, setAutoTopUp] = useState(true);
  const [open, setOpen] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  return (
    <div className="flex w-full max-w-md justify-end">
      <CreditsMenu
        remaining={41590}
        total={upgraded ? 250000 : 100000}
        plan={{ name: upgraded ? "Scale" : "Pro Plan", price: upgraded ? "$99/month" : "$49/month", resetLabel: "Nov 1" }}
        refill={100000}
        rateLimit="600 req/min"
        autoTopUp={autoTopUp}
        onAutoTopUpChange={setAutoTopUp}
        autoTopUpDescription="Adds 10K credits for $5 when you drop under 1K."
        onUpgrade={() => setOpen(true)}
        usageAction={
          <a href="/preview/usage-card/Product">
            <Gauge className="size-3.5" strokeWidth={1.5} />
            View usage
          </a>
        }
      />
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Change plan</DialogTitle><DialogDescription>This updates the example plan.</DialogDescription></DialogHeader><DialogBody><Button variant="brand" onClick={() => { setUpgraded((value) => !value); setOpen(false); }}>Choose {upgraded ? "Pro" : "Scale"}</Button></DialogBody></DialogContent></Dialog>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex w-full max-w-md justify-end">
      <CreditsMenu remaining={0} plan={{ name: "Free" }} loading />
    </div>
  );
}
