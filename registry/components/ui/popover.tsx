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

// The content scrolls inside the panel (4px into its padding, so focus rings are not clipped), so its scroll edges fade
// (fade-y) without fading the panel's own shadow.
function PopoverContent({ className, children, align = "start", sideOffset = 6, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal container={usePortalContainer()}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn("z-50 flex max-h-(--radix-popover-content-available-height) w-72 max-w-[calc(100vw-1rem)] origin-(--radix-popover-content-transform-origin) animate-pop-in flex-col overflow-hidden rounded-shell bg-surface p-3 text-body-sm text-fg shadow-floating outline-none", className)}
        {...props}
      >
        <div data-slot="popover-viewport" className="ds-scrollbar fade-y -m-1 min-h-0 overflow-y-auto p-1">{children}</div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
