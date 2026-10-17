"use client";

import * as React from "react";

import { useTabGlide } from "@/hooks/use-tab-glide";
import { cn } from "@/lib/utils";

// The dashboard's tabs used as a value picker inside a form or a chart (form.tsx SegmentedControl): the same gliding
// soft gray pill, with radio semantics. `segmented` sits the options on a gray track with a white pill.
type Option<T extends string> = { value: T; label: React.ReactNode; count?: number };

const INNER_RADIUS = "rounded-[calc(var(--ds-radius-control)-0.125rem)]";
const PILL_SURFACE = { plain: "bg-wash-pill", segmented: "bg-surface shadow-[0_1px_3px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.03)]" };

function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  size = "md",
  variant = "plain",
  className,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
  label: string;
  size?: "sm" | "md";
  variant?: "plain" | "segmented";
  className?: string;
}) {
  const pillRef = React.useRef<HTMLSpanElement>(null);
  const isPlaced = useTabGlide(pillRef, value);
  const segmented = variant === "segmented";
  const radius = size === "sm" || segmented ? INNER_RADIUS : "rounded-control";

  return (
    <div
      role="radiogroup"
      aria-label={label}
      data-slot="segmented-control"
      className={cn("relative isolate inline-flex w-fit items-center", segmented ? "gap-0.5 rounded-control bg-neutral-5 p-0.5" : size === "sm" ? "gap-0.5" : "gap-1", className)}
    >
      <span ref={pillRef} aria-hidden className={cn("pointer-events-none absolute top-0 left-0 -z-10", radius, PILL_SURFACE[variant], !isPlaced && "invisible")} />
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            data-tab-id={o.value}
            onClick={() => onValueChange(o.value)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap outline-none transition-[color] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none",
              radius,
              size === "sm" ? "h-7 px-3 text-caption" : segmented ? "h-8 px-3.5 text-body-sm" : "h-9 px-4 text-body-sm",
              // Only the text answers a hover, so nothing fades over the pill gliding in beneath.
              selected ? "text-fg" : cn("hover:text-fg", segmented ? "text-fg-muted" : "text-fg-subtle"),
              // Until the pill lands, the selected option draws the surface itself so the first paint matches.
              selected && !isPlaced && PILL_SURFACE[variant],
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn("tabular-nums transition-[color] duration-200 ease-out", selected ? "text-fg-muted" : "text-fg-subtle")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedControl };
