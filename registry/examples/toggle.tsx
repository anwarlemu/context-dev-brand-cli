"use client";

import { useState } from "react";
import { Bold, Italic, WrapText } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

// On a docs page: wrap long lines in a code sample.
export function Site() {
  return (
    <Toggle variant="outline" aria-label="Wrap lines" defaultPressed>
      <WrapText strokeWidth={1.5} /> Wrap lines
    </Toggle>
  );
}

// In a response viewer's toolbar: view options, sizes and a disabled one.
export function Product() {
  const [raw, setRaw] = useState(false);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Toggle pressed={raw} onPressedChange={setRaw}>Raw HTML</Toggle>
        <Toggle variant="outline" defaultPressed>
          <WrapText strokeWidth={1.5} /> Wrap
        </Toggle>
        <Toggle size="sm" aria-label="Bold">
          <Bold strokeWidth={1.75} />
        </Toggle>
        <Toggle size="sm" aria-label="Italic">
          <Italic strokeWidth={1.75} />
        </Toggle>
        <Toggle size="lg" variant="outline">Large</Toggle>
        <Toggle disabled>Disabled</Toggle>
      </div>
      <p className="text-caption text-fg-subtle">Showing the {raw ? "raw HTML" : "rendered Markdown"}.</p>
    </div>
  );
}
