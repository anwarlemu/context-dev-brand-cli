"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff, Search } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

// On the home page: try the API on any website.
export function Site() {
  return (
    <div className="grid w-full max-w-md gap-2">
      <Label htmlFor="try-url">Website</Label>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput id="try-url" placeholder="stripe.com" />
      </InputGroup>
    </div>
  );
}

// In the product: search, a secret with show and copy, a domain suffix, a unit, a textarea with a footer, and states.
export function Product() {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const key = "ctx_live_8f2a91c4e07b";
  return (
    <div className="grid w-full max-w-md gap-4">
      <InputGroup>
        <InputGroupAddon>
          <Search strokeWidth={1.5} />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search requests" aria-label="Search requests" />
      </InputGroup>
      <div className="grid gap-2">
        <Label htmlFor="api-key">API key</Label>
        <InputGroup>
          <InputGroupInput id="api-key" readOnly type={shown ? "text" : "password"} value={key} className="font-mono" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label={shown ? "Hide key" : "Show key"} onClick={() => setShown((s) => !s)}>
              {shown ? <EyeOff strokeWidth={1.5} /> : <Eye strokeWidth={1.5} />}
            </InputGroupButton>
            <InputGroupButton size="icon-xs" aria-label={copied ? "Copied" : "Copy key"} onClick={() => navigator.clipboard.writeText(key).then(() => setCopied(true), () => undefined)}>
              {copied ? <Check strokeWidth={1.75} /> : <Copy strokeWidth={1.5} />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sender">Sending domain</Label>
        <InputGroup>
          <InputGroupInput id="sender" defaultValue="alerts" />
          <InputGroupAddon align="inline-end" variant="segment">@acme.com</InputGroupAddon>
        </InputGroup>
      </div>
      <InputGroup className="w-40">
        <InputGroupInput defaultValue="250" aria-label="Timeout" inputMode="numeric" />
        <InputGroupAddon align="inline-end">ms</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea placeholder="Describe what to extract" aria-label="Extraction prompt" />
        <InputGroupAddon align="block-end" className="justify-between">
          <InputGroupText>Uses 1 credit per page</InputGroupText>
          <InputGroupButton variant="brand" size="xs">Run</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-invalid defaultValue="not a url" aria-label="Callback URL" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput disabled defaultValue="org_3f9a2c" aria-label="Organization" />
      </InputGroup>
    </div>
  );
}
