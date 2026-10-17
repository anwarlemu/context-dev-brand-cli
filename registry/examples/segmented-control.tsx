"use client";

import { useState } from "react";

import { SegmentedControl } from "@/components/ui/segmented-control";

export function Product() {
  const [range, setRange] = useState<"24h" | "7d" | "30d">("7d");
  return (
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
  );
}
