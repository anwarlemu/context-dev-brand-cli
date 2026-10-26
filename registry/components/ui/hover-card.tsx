"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A preview on hover, drawn as the dashboard's floating panel (the popover): shell corners, a hairline in the shadow,
// 12px inside, 6px off its trigger, growing out of the corner nearest it in a short ease-out pop. It waits half a
// second before opening, so a pointer passing over a link doesn't flash it, and closes a beat after the pointer leaves.
// Keyboard focus on the trigger opens it too.
function HoverCard({ openDelay = 500, closeDelay = 150, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" openDelay={openDelay} closeDelay={closeDelay} {...props} />;
}

function HoverCardTrigger(props: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

function HoverCardContent({ className, align = "start", sideOffset = 6, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal container={usePortalContainer()}>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn("z-50 w-72 max-w-[calc(100vw-1rem)] origin-(--radix-hover-card-content-transform-origin) animate-pop-in rounded-shell bg-surface p-3 text-body-sm text-fg shadow-floating outline-none", className)}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
