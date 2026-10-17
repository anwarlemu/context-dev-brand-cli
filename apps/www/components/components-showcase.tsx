"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";

// The home page's Components card: one small product form built from the primitives, rather than a row of every
// variant.
export function ComponentsShowcase() {
  const [range, setRange] = useState<"hourly" | "daily" | "weekly">("daily");
  return (
    <Card className="mx-auto w-full max-w-90 gap-4 p-5">
      <div className="flex items-center justify-between">
        <span className="text-body font-medium text-fg">Pricing page monitor</span>
        <Badge variant="success">Active</Badge>
      </div>
      <Input defaultValue="https://acme.com/pricing" aria-label="URL" />
      <SegmentedControl
        label="Check"
        value={range}
        onValueChange={setRange}
        options={[
          { value: "hourly", label: "Hourly" },
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
        ]}
      />
      <label className="flex items-center justify-between text-body-sm text-fg-muted">
        Email me on changes
        <Switch defaultChecked />
      </label>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button variant="brand" size="sm">
          Save monitor
        </Button>
      </div>
    </Card>
  );
}
