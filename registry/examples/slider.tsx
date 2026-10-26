"use client";

import { useState } from "react";

import { Slider } from "@/components/ui/slider";

// On the pricing page: an estimate from monthly requests.
export function Site() {
  const [requests, setRequests] = useState([50]);
  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="flex items-baseline justify-between">
        <span id="requests-label" className="text-body text-fg">Requests a month</span>
        <span className="text-body text-fg tabular-nums">{requests[0]}k</span>
      </div>
      <Slider value={requests} onValueChange={setRequests} min={5} max={500} step={5} aria-labelledby="requests-label" />
    </div>
  );
}

// In a crawl's settings: depth, a range of page sizes and a disabled limit.
export function Product() {
  const [depth, setDepth] = useState([3]);
  const [size, setSize] = useState([10, 400]);
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div className="grid gap-3">
        <div className="flex items-baseline justify-between text-body-sm">
          <span id="depth-label" className="text-fg">Crawl depth</span>
          <span className="text-fg-muted tabular-nums">{depth[0]} links</span>
        </div>
        <Slider value={depth} onValueChange={setDepth} min={1} max={10} aria-labelledby="depth-label" />
      </div>
      <div className="grid gap-3">
        <div className="flex items-baseline justify-between text-body-sm">
          <span id="size-label" className="text-fg">Page size</span>
          <span className="text-fg-muted tabular-nums">{size[0]} to {size[1]} KB</span>
        </div>
        <Slider value={size} onValueChange={setSize} min={0} max={1000} step={10} aria-labelledby="size-label" />
      </div>
      <div className="grid gap-3">
        <span id="concurrency-label" className="text-body-sm text-fg">Concurrency (on Pro)</span>
        <Slider defaultValue={[2]} max={10} disabled aria-labelledby="concurrency-label" />
      </div>
    </div>
  );
}
