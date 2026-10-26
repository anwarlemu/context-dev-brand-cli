"use client";

import { useState } from "react";

import { type DateRange } from "@/components/ui/calendar";
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

const TODAY = new Date(2026, 9, 26);
const days = (n: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + n);

// On the demo request form: a preferred day.
export function Site() {
  return (
    <div className="grid w-full max-w-xs gap-2">
      <Label htmlFor="demo-day">Preferred day</Label>
      <DatePicker id="demo-day" name="demoDay" placeholder="Pick a day" calendar={{ today: TODAY, disabled: [{ dayOfWeek: [0, 6] }, { before: TODAY }] }} />
    </div>
  );
}

// In the product: an API key's expiry with presets, a usage window, and invalid and disabled fields.
export function Product() {
  const [expiry, setExpiry] = useState<Date | undefined>(days(30));
  const [window, setWindow] = useState<DateRange | undefined>({ from: days(-6), to: TODAY });
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="key-expiry">Key expires</Label>
        <DatePicker
          id="key-expiry"
          value={expiry}
          onValueChange={setExpiry}
          presets={[
            { label: "In a week", value: days(7) },
            { label: "In 30 days", value: days(30) },
            { label: "In 90 days", value: days(90) },
          ]}
          calendar={{ today: TODAY, disabled: { before: TODAY } }}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="usage-window">Usage window</Label>
        <DateRangePicker
          id="usage-window"
          value={window}
          onValueChange={setWindow}
          presets={[
            { label: "Last 7 days", value: { from: days(-6), to: TODAY } },
            { label: "Last 30 days", value: { from: days(-29), to: TODAY } },
          ]}
          calendar={{ today: TODAY, disabled: { after: TODAY } }}
        />
      </div>
      <DatePicker aria-label="Start date" aria-invalid placeholder="A start date is required" calendar={{ today: TODAY }} />
      <DatePicker aria-label="Locked date" disabled defaultValue={TODAY} />
    </div>
  );
}
