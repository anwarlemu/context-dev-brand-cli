"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

const COUNTRIES = ["Canada", "France", "Germany", "Japan", "Netherlands", "Singapore", "Spain", "United Kingdom", "United States"];
const DOMAINS = ["acme.com", "docs.acme.com", "shop.acme.com", "blog.acme.com", "status.acme.com", "careers.acme.com"];

// On the contact page: where the team is.
export function Site() {
  const [country, setCountry] = useState<string | null>(null);
  return (
    <div className="grid w-full max-w-xs gap-2">
      <Label id="country-label">Country</Label>
      <Combobox items={COUNTRIES} value={country} onValueChange={setCountry} name="country">
        <ComboboxTrigger aria-labelledby="country-label">
          <ComboboxValue placeholder="Choose a country" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search countries" />
          <ComboboxList>
            <ComboboxEmpty>No country with that name.</ComboboxEmpty>
            {COUNTRIES.map((c) => (
              <ComboboxItem key={c} value={c}>{c}</ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

// In a monitor: one organization from groups, then several domains as chips.
export function Product() {
  const [org, setOrg] = useState<string | null>("acme");
  const [domains, setDomains] = useState(["acme.com", "docs.acme.com"]);
  return (
    <div className="grid w-full max-w-sm gap-5">
      <div className="grid gap-2">
        <Label id="org-label">Organization</Label>
        <Combobox items={[{ value: "acme", label: "Acme" }, { value: "globex", label: "Globex" }, { value: "initech", label: "Initech" }]} value={org} onValueChange={setOrg}>
          <ComboboxTrigger aria-labelledby="org-label">
            <ComboboxValue placeholder="Choose an organization" />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput placeholder="Search organizations" />
            <ComboboxList>
              <ComboboxEmpty>No organization found.</ComboboxEmpty>
              <ComboboxGroup heading="Yours">
                <ComboboxItem value="acme" label="Acme">Acme</ComboboxItem>
                <ComboboxItem value="globex" label="Globex">Globex</ComboboxItem>
              </ComboboxGroup>
              <ComboboxSeparator />
              <ComboboxGroup heading="Shared with you">
                <ComboboxItem value="initech" label="Initech">Initech</ComboboxItem>
                <ComboboxItem value="hooli" label="Hooli" disabled>Hooli (invite pending)</ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="grid gap-2">
        <Label id="domains-label">Domains to monitor</Label>
        <Combobox multiple items={DOMAINS} value={domains} onValueChange={setDomains}>
          <ComboboxChips aria-labelledby="domains-label">
            {domains.map((d) => (
              <ComboboxChip key={d} value={d} />
            ))}
            <ComboboxChipsInput placeholder={domains.length ? "" : "Add a domain"} aria-labelledby="domains-label" />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty>No domain matches.</ComboboxEmpty>
              {DOMAINS.map((d) => (
                <ComboboxItem key={d} value={d}>
                  <Globe strokeWidth={1.5} /> {d}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}
