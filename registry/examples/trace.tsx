"use client";

import { useState } from "react";
import { Check, FileSearch, Globe, Map, OctagonAlert, ScanText } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";

export function Site() {
  return (
    <Trace className="max-w-md">
      <TraceLine>
        <TraceIcon>
          <Map strokeWidth={1.5} />
        </TraceIcon>
        <TraceTitle>Read the sitemap</TraceTitle>
        <TraceDescription>0.4s</TraceDescription>
      </TraceLine>
      <TraceLine>
        <TraceIcon>
          <Globe strokeWidth={1.5} />
        </TraceIcon>
        <TraceTitle>Rendered 1,240 pages</TraceTitle>
        <TraceDescription>38s</TraceDescription>
      </TraceLine>
      <TraceLine>
        <TraceIcon>
          <Check strokeWidth={1.5} />
        </TraceIcon>
        <TraceTitle>Returned clean markdown</TraceTitle>
      </TraceLine>
    </Trace>
  );
}

export function Product() {
  const [open, setOpen] = useState(true);
  return (
    <Trace className="max-w-lg rounded-card bg-surface px-5 py-4 shadow-card">
      <TraceLine>
        <TraceIcon>
          <Map strokeWidth={1.5} />
        </TraceIcon>
        <TraceTitle>Fetched sitemap.xml</TraceTitle>
        <TraceDescription>412 ms</TraceDescription>
      </TraceLine>
      <TraceCollapsible open={open} onOpenChange={setOpen}>
        <TraceCollapsibleTrigger>
          <TraceLine status="error">
            <TraceIcon>
              <OctagonAlert strokeWidth={1.5} />
            </TraceIcon>
            <TraceTitle>3 pages returned 403</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          example.com/account, example.com/cart and example.com/checkout block automated browsers. Retry them with a residential proxy, or leave them out of the crawl.
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine status="running">
        <TraceIcon>
          <Spinner className="size-4" />
        </TraceIcon>
        <TraceTitle>Parsing 1,237 pages</TraceTitle>
        <TraceDescription>812 of 1,237</TraceDescription>
      </TraceLine>
      <TraceLine status="pending">
        <TraceIcon>
          <ScanText strokeWidth={1.5} />
        </TraceIcon>
        <TraceTitle>Write results to the dataset</TraceTitle>
      </TraceLine>
    </Trace>
  );
}

export function Linked() {
  return (
    <Trace className="max-w-md">
      <a href="#batch-4102">
        <TraceLine>
          <TraceIcon>
            <FileSearch strokeWidth={1.5} />
          </TraceIcon>
          <TraceTitle>Open batch 4102</TraceTitle>
          <TraceDescription>2,400 URLs</TraceDescription>
        </TraceLine>
      </a>
      <TraceCollapsible defaultOpen={false}>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Globe strokeWidth={1.5} />
            </TraceIcon>
            <TraceTitle>Request details</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>POST /v1/batch with 2,400 URLs, format markdown, maxAge 1 day.</TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
