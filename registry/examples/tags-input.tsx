"use client";

import { useState } from "react";

import { Field } from "@/components/ui/field";
import { TagsInput } from "@/components/ui/tags-input";

export function Product() {
  const [domains, setDomains] = useState(["acme.com", "globex.io", "not a domain"]);
  return (
    <div className="w-full max-w-md">
      <Field label="Domains" htmlFor="domains" help="Press Enter or type a comma after each one.">
        <TagsInput id="domains" tags={domains} onTagsChange={setDomains} placeholder="acme.com" isTagInvalid={(tag) => !/^[\w-]+(\.[\w-]+)+$/.test(tag)} />
      </Field>
    </div>
  );
}
