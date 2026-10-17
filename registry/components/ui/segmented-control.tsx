"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The dashboard's tabs used as a value picker inside a form or a chart: the same soft gray pill, radio semantics.
type Option<T extends string> = { value: T; label: React.ReactNode };

function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  size = "md",
  className,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} data-slot="segmented-control" className={cn("inline-flex w-fit items-center", size === "sm" ? "gap-0.5" : "gap-1", className)}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onValueChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-control whitespace-nowrap outline-none transition-[background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
              size === "sm" ? "h-7 px-3 text-caption" : "h-9 px-4 text-body-sm",
              selected ? "bg-wash-pill text-fg" : "text-fg-subtle hover:text-fg",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedControl };
