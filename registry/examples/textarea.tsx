"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Product() {
  const [schema, setSchema] = useState("{ plans: [");
  let valid = true;
  try { JSON.parse(schema); } catch { valid = false; }
  return (
    <div className="grid w-full max-w-sm gap-5">
      <div className="grid gap-2">
        <Label htmlFor="example-prompt">Prompt</Label>
        <Textarea id="example-prompt" placeholder="Find the pricing page and list every plan." />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="example-schema">Schema</Label>
        <Textarea id="example-schema" value={schema} onChange={(event) => setSchema(event.target.value)} aria-invalid={!valid} aria-describedby="schema-help" />
        <p id="schema-help" aria-live="polite" className={`text-caption ${valid ? "text-fg-subtle" : "text-danger"}`}>{valid ? "Valid JSON." : "This isn't valid JSON yet."}</p>
      </div>
    </div>
  );
}

export function Site() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="example-message">How can we help?</Label>
      <Textarea id="example-message" placeholder="Tell us what you're building." />
    </div>
  );
}
