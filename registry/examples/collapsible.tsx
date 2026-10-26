"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ROW = "group flex w-full items-center gap-2 rounded-control py-1.5 text-left text-body-sm text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none";
const CHEVRON = "size-3.5 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-90 motion-reduce:transition-none";

export function Site() {
  return (
    <Collapsible className="w-full max-w-md">
      <CollapsibleTrigger className={ROW}>
        <ChevronRight className={CHEVRON} strokeWidth={1.5} />
        What counts as one credit?
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pl-5.5 text-body-sm text-fg-muted">
        One successful call to any API is one credit. Failed calls and cached repeats within an hour are free.
      </CollapsibleContent>
    </Collapsible>
  );
}

export function Product() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="w-full max-w-md rounded-card bg-surface p-4 shadow-card">
      <p className="text-body-sm text-fg">GET /v1/brand/retrieve</p>
      <p className="mt-0.5 text-caption text-fg-subtle">200 in 412ms</p>
      <Collapsible open={open} onOpenChange={setOpen} className="mt-3 border-t border-line-subtle pt-2">
        <CollapsibleTrigger className={ROW}>
          <ChevronRight className={CHEVRON} strokeWidth={1.5} />
          {open ? "Hide" : "Show"} response headers
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-1.5">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-caption">
            <dt className="text-fg-subtle">content-type</dt>
            <dd className="text-fg">application/json</dd>
            <dt className="text-fg-subtle">x-credits-used</dt>
            <dd className="text-fg">1</dd>
            <dt className="text-fg-subtle">x-request-id</dt>
            <dd className="truncate text-fg">req_9f2c41b7e0a8</dd>
          </dl>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function Disabled() {
  return (
    <Collapsible disabled className="w-full max-w-md">
      <CollapsibleTrigger className={`${ROW} disabled:opacity-40`}>
        <ChevronRight className={CHEVRON} strokeWidth={1.5} />
        Advanced parameters (on the Scale plan)
      </CollapsibleTrigger>
      <CollapsibleContent>Hidden</CollapsibleContent>
    </Collapsible>
  );
}
