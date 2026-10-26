"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

// A value along a line, extrapolated from the switch: a 4px pale track (the switch's off fill) filled brand blue up to
// the value, and a 16px white thumb with the key's soft drop and a hairline. Under the pointer or keyboard focus the
// thumb takes the blue hover ring; it never animates its position (it follows the pointer). Pass two values for a range.
function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = React.useMemo(() => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]), [value, defaultValue, min, max]);
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-pill bg-neutral-10 data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
      >
        <SliderPrimitive.Range data-slot="slider-range" className="absolute bg-brand data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={props["aria-label"] ? undefined : values.length > 1 ? (index === 0 ? "Minimum" : "Maximum") : undefined}
          className="block size-4 shrink-0 cursor-grab rounded-pill bg-white shadow-[var(--ds-shadow-key),0_0_0_1px_var(--ds-color-border-hairline)] outline-none transition-[box-shadow] duration-150 ease-out hover:shadow-[var(--ds-shadow-key),var(--ds-shadow-ring-hover)] focus-visible:shadow-[var(--ds-shadow-key),var(--ds-shadow-ring-hover)] active:cursor-grabbing disabled:pointer-events-none motion-reduce:transition-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
