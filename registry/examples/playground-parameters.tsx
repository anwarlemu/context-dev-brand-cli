"use client";

import * as React from "react";

import { ParameterGroup, ParameterInput, ParameterRow, ParametersButton, ParameterSelect, ParameterUnitInput, PlaygroundParameters } from "@/components/product/playground-parameters";
import { Switch } from "@/components/ui/switch";

const DEFAULTS = { format: "markdown", mainOnly: true, maxAge: "0", wait: "", include: "" };

export function Product() {
  const [open, setOpen] = React.useState(true);
  const [values, setValues] = React.useState(DEFAULTS);
  const set = <K extends keyof typeof DEFAULTS>(key: K, value: (typeof DEFAULTS)[K]) => setValues((v) => ({ ...v, [key]: value }));
  const changed = (Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[]).filter((k) => values[k] !== DEFAULTS[k]).length;
  return (
    <div className="flex w-full max-w-xl flex-col items-end gap-3">
      <ParametersButton open={open} onToggle={() => setOpen((o) => !o)} modifiedCount={changed} />
      <PlaygroundParameters open={open} onOpenChange={setOpen} modifiedCount={changed} onReset={() => setValues(DEFAULTS)} className="h-120">
        <ParameterGroup title="Output">
          <ParameterRow label="Format" description="What the page comes back as.">
            <ParameterSelect
              label="Format"
              value={values.format}
              onValueChange={(v) => set("format", v)}
              options={[
                { value: "markdown", label: "Markdown" },
                { value: "html", label: "HTML" },
                { value: "text", label: "Plain text" },
              ]}
            />
          </ParameterRow>
          <ParameterRow label="Main content only" description="Drops navigation, footers and cookie banners." onReset={values.mainOnly === DEFAULTS.mainOnly ? undefined : () => set("mainOnly", DEFAULTS.mainOnly)}>
            <Switch checked={values.mainOnly} onCheckedChange={(v) => set("mainOnly", v)} aria-label="Main content only" />
          </ParameterRow>
        </ParameterGroup>
        <ParameterGroup title="Fetching" count={3}>
          <ParameterRow label="Max age" description="Serve a cached copy up to this old." help="0 always fetches the live page. Cached responses cost no credits.">
            <ParameterUnitInput unit="sec" value={values.maxAge} min={0} onChange={(e) => set("maxAge", e.target.value)} aria-label="Max age in seconds" />
          </ParameterRow>
          <ParameterRow label="Browser wait" description="How long to let scripts run before reading the page.">
            <ParameterUnitInput unit="ms" value={values.wait} placeholder="0" min={0} onChange={(e) => set("wait", e.target.value)} aria-label="Browser wait in milliseconds" />
          </ParameterRow>
          <ParameterRow label="Include tags" description="Only keep these elements, comma separated." stacked>
            <ParameterInput className="w-full font-mono" placeholder="article, main" value={values.include} onChange={(e) => set("include", e.target.value)} aria-label="Include tags" />
          </ParameterRow>
        </ParameterGroup>
      </PlaygroundParameters>
    </div>
  );
}

export function Fetching() {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="grid w-full max-w-xl gap-3"><ParametersButton open={open} onToggle={() => setOpen((value) => !value)} modifiedCount={0} />
    <PlaygroundParameters open={open} onOpenChange={setOpen} modifiedCount={0} fetching>
      <ParameterGroup title="Output">
        <ParameterRow label="Main content only" description="Drops navigation, footers and cookie banners.">
          <Switch defaultChecked aria-label="Main content only" />
        </ParameterRow>
      </ParameterGroup>
    </PlaygroundParameters></div>
  );
}
