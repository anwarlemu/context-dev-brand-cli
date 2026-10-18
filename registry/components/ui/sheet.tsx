"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A side panel (the dashboard's monitor detail panel): a white panel in a 6px frame floating over the page's edge, no
// scrim, so opening it never reflows or dims what is behind. It slides 8px in as it fades (200ms, ease-out); reduced
// motion keeps the fade. Like the dashboard's list, the page remains usable while the details are open.
function Sheet({ modal = false, ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" modal={modal} {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

const SIDES = {
  right: "inset-y-4 right-4 w-[min(440px,calc(100%-2rem))] starting:translate-x-2 data-[state=closed]:animate-sheet-right-out",
  left: "inset-y-4 left-4 w-[min(440px,calc(100%-2rem))] starting:-translate-x-2 data-[state=closed]:animate-sheet-left-out",
  bottom: "inset-x-2 bottom-2 max-h-[85vh] starting:translate-y-2 data-[state=closed]:animate-sheet-bottom-out",
} as const;

function SheetContent({ className, children, side = "right", onInteractOutside = (event) => event.preventDefault(), onOpenAutoFocus = (event) => event.preventDefault(), ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: keyof typeof SIDES }) {
  const container = usePortalContainer();
  return (
    <SheetPrimitive.Portal container={container}>
      <SheetPrimitive.Content
        data-slot="sheet-content"
        onInteractOutside={onInteractOutside}
        onOpenAutoFocus={onOpenAutoFocus}
        className={cn(
          "z-20 flex flex-col rounded-shell bg-surface p-(--ds-space-frame) shadow-floating outline-none transition-[opacity,translate] duration-200 ease-emphasized starting:opacity-0 motion-reduce:starting:translate-x-0 motion-reduce:starting:translate-y-0",
          container ? "absolute" : "fixed",
          SIDES[side],
          className,
        )}
        {...props}
      >
        <div className="relative flex min-h-0 flex-1 flex-col rounded-card bg-surface">{children}</div>
        <SheetPrimitive.Close
          aria-label="Close"
          className="absolute top-5.5 right-5 grid size-8 place-items-center rounded-control text-fg-subtle transition-colors duration-150 ease-out outline-none hover:bg-wash-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring [&_svg]:size-4"
        >
          <X strokeWidth={1.5} />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 px-5 pt-5 pr-14", className)} {...props} />;
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-body" className={cn("ds-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-5 pb-5 text-body-sm text-fg", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("truncate text-h5 leading-snug font-normal tracking-normal text-fg", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-body-sm text-fg-muted", className)} {...props} />;
}

export { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger };
