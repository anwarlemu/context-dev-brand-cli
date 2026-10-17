"use client";

import { useState } from "react";

import { SegmentedControl } from "@/components/ui/segmented-control";

export function Product() {
  const [range, setRange] = useState<"24h" | "7d" | "30d">("7d");
  const [view, setView] = useState<"requests" | "credits">("requests");
  return (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControl
        label="Range"
        value={range}
        onValueChange={setRange}
        options={[
          { value: "24h", label: "24h" },
          { value: "7d", label: "7 days" },
          { value: "30d", label: "30 days" },
        ]}
      />
      <SegmentedControl
        label="Chart"
        variant="segmented"
        value={view}
        onValueChange={setView}
        options={[
          { value: "requests", label: "Requests" },
          { value: "credits", label: "Credits" },
        ]}
      />
    </div>
  );
}
