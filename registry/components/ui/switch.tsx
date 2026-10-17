"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

// The thumb sits 3/16 rem inside the track on every side, so it reads as held by the track. Off, a hairline gives the
// pale track an edge; on, the brand blue needs none. Measured in rem so the travel scales with the root size.
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-pill transition-[background-color,box-shadow] duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-brand data-[state=unchecked]:bg-neutral-10 data-[state=unchecked]:shadow-[inset_0_0_0_1px_var(--ds-color-border-hairline)] motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-3.5 rounded-pill bg-white shadow-[0_1px_2px_rgb(0_0_0/0.12)] transition-transform duration-200 ease-out data-[state=checked]:translate-x-[1.1875rem] data-[state=unchecked]:translate-x-[0.1875rem] motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
