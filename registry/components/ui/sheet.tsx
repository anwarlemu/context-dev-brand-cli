"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A side panel (the dashboard's monitor detail): the same white frame as a dialog, docked to an edge, sliding in a
// short distance as it fades.
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

const SIDES = {
  right: "inset-y-2 right-2 w-[min(28rem,calc(100%-1rem))] data-[state=open]:animate-[ds-sheet-right_var(--ds-duration-moderate)_var(--ds-easing-out)]",
  left: "inset-y-2 left-2 w-[min(28rem,calc(100%-1rem))] data-[state=open]:animate-[ds-sheet-left_var(--ds-duration-moderate)_var(--ds-easing-out)]",
  bottom: "inset-x-2 bottom-2 max-h-[85vh] data-[state=open]:animate-content-in",
} as const;

function SheetContent({ className, children, side = "right", ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: keyof typeof SIDES }) {
  const container = usePortalContainer();
  return (
    <SheetPrimitive.Portal container={container}>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 animate-fade-in bg-scrim" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn("fixed z-50 flex flex-col overflow-y-auto rounded-shell bg-surface shadow-floating outline-none", SIDES[side], className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          aria-label="Close"
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-control text-fg-subtle transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&_svg]:size-4"
        >
          <X strokeWidth={1.5} />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 border-b border-line-subtle px-5 py-4 pr-14", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-h5 font-normal text-fg", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-body-sm text-fg-muted", className)} {...props} />;
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger };
