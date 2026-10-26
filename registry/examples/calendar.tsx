"use client";

import { useState } from "react";

import { Calendar, type DateRange } from "@/components/ui/calendar";

const TODAY = new Date(2026, 9, 26);

// On the demo page: pick a day for a call (weekends off, nothing in the past).
export function Site() {
  const [day, setDay] = useState<Date | undefined>(new Date(2026, 9, 29));
  return (
    <div className="grid justify-items-center gap-2">
      <div className="rounded-card shadow-card">
        <Calendar mode="single" selected={day} onSelect={setDay} today={TODAY} disabled={[{ dayOfWeek: [0, 6] }, { before: TODAY }]} />
      </div>
      <p className="text-body-sm text-fg-muted">{day ? `Call on ${day.toDateString()}` : "Pick a day"}</p>
    </div>
  );
}

// In usage: a report window over two months, then several run days, and month and year dropdowns.
export function Product() {
  const [range, setRange] = useState<DateRange | undefined>({ from: new Date(2026, 9, 6), to: new Date(2026, 9, 19) });
  const [days, setDays] = useState<Date[]>([new Date(2026, 9, 5), new Date(2026, 9, 12)]);
  return (
    <div className="grid justify-items-center gap-4">
      <div className="rounded-card bg-surface shadow-card">
        <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} today={TODAY} />
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <div className="rounded-card bg-surface shadow-card">
          <Calendar mode="multiple" selected={days} onSelect={setDays} today={TODAY} weekStartsOn={1} showOutsideDays={false} />
        </div>
        <div className="rounded-card bg-surface shadow-card">
          <Calendar mode="single" captionLayout="dropdown" fromYear={2020} toYear={2030} defaultMonth={TODAY} today={TODAY} />
        </div>
      </div>
    </div>
  );
}
