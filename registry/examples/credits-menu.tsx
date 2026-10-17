"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";

import { CreditsMenu } from "@/components/product/credits-menu";

export function Product() {
  const [autoTopUp, setAutoTopUp] = useState(true);
  return (
    <div className="flex w-full max-w-md justify-end">
      <CreditsMenu
        remaining={41590}
        total={100000}
        plan={{ name: "Pro Plan", price: "$49/month", resetLabel: "Nov 1" }}
        refill={100000}
        rateLimit="600 req/min"
        autoTopUp={autoTopUp}
        onAutoTopUpChange={setAutoTopUp}
        autoTopUpDescription="Adds 10K credits for $5 when you drop under 1K."
        onUpgrade={() => {}}
        usageAction={
          <a href="#">
            <Gauge className="size-3.5" strokeWidth={1.5} />
            View usage
          </a>
        }
      />
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
