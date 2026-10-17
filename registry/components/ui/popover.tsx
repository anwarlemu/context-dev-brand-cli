"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// The dashboard's floating panel: shell corners, a hairline in the shadow, 6px off its trigger, growing out of the
// corner nearest the trigger.
function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({ className, align = "start", sideOffset = 6, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal container={usePortalContainer()}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn("z-50 w-72 origin-(--radix-popover-content-transform-origin) animate-pop-in rounded-shell bg-surface p-3 text-body-sm text-fg shadow-floating outline-none", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
