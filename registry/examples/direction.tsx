"use client";

import { DirectionProvider, useDirection } from "@/components/ui/direction";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

function Reading() {
  const dir = useDirection();
  return <p className="text-caption text-fg-subtle">Reading direction: {dir}</p>;
}

// A right-to-left page: the toggle group and slider flip their order and keys.
export function Site() {
  return (
    <DirectionProvider dir="rtl">
      <div dir="rtl" className="grid w-full max-w-xs gap-3">
        <ToggleGroup type="single" defaultValue="month" aria-label="Billing">
          <ToggleGroupItem value="month">شهري</ToggleGroupItem>
          <ToggleGroupItem value="year">سنوي</ToggleGroupItem>
        </ToggleGroup>
        <Reading />
      </div>
    </DirectionProvider>
  );
}

// The same controls left to right and right to left, side by side.
export function Product() {
  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      {(["ltr", "rtl"] as const).map((dir) => (
        <DirectionProvider key={dir} dir={dir}>
          <div dir={dir} className="grid gap-3">
            <Slider defaultValue={[30]} aria-label={`Limit (${dir})`} />
            <Reading />
          </div>
        </DirectionProvider>
      ))}
    </div>
  );
}
