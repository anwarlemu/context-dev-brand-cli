"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// On a pricing page: how the team wants to be billed.
export function Site() {
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-3 text-body text-fg">Billing</legend>
      <RadioGroup defaultValue="yearly" name="billing">
        <div className="flex items-center gap-2.5">
          <RadioGroupItem value="monthly" id="billing-monthly" />
          <Label htmlFor="billing-monthly">Monthly</Label>
        </div>
        <div className="flex items-center gap-2.5">
          <RadioGroupItem value="yearly" id="billing-yearly" />
          <Label htmlFor="billing-yearly">Yearly (two months free)</Label>
        </div>
      </RadioGroup>
    </fieldset>
  );
}

// In a scrape request's settings: the output format, with an unavailable option.
export function Product() {
  const [format, setFormat] = useState("markdown");
  return (
    <div className="grid gap-3">
      <p id="format-label" className="text-body-sm text-fg">Output format</p>
      <RadioGroup value={format} onValueChange={setFormat} aria-labelledby="format-label">
        {[
          ["markdown", "Markdown"],
          ["html", "HTML"],
          ["text", "Plain text"],
        ].map(([value, label]) => (
          <div key={value} className="flex items-center gap-2.5">
            <RadioGroupItem value={value} id={`format-${value}`} />
            <Label htmlFor={`format-${value}`}>{label}</Label>
          </div>
        ))}
        <div className="flex items-center gap-2.5" data-disabled="true">
          <RadioGroupItem value="pdf" id="format-pdf" disabled />
          <Label htmlFor="format-pdf">PDF (on Pro)</Label>
        </div>
      </RadioGroup>
      <p className="text-caption text-fg-subtle">Requests return {format === "html" ? "HTML" : format === "text" ? "plain text" : "Markdown"}.</p>
    </div>
  );
}
