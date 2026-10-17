"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// The dashboard's dialog: a white panel in a 6px frame that floats on a hairline and a soft shadow, rising 4px as it
// fades in. Radix adds the focus trap, scroll lock and Escape.
function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  const container = usePortalContainer();
  return <DialogPrimitive.Portal data-slot="dialog-portal" container={container} {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn("fixed inset-0 z-50 animate-fade-in bg-scrim", className)} {...props} />;
}

const WIDTHS = { md: "max-w-lg", lg: "max-w-3xl", xl: "max-w-5xl", "2xl": "max-w-6xl" } as const;

function DialogContent({
  className,
  children,
  size = "md",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { size?: keyof typeof WIDTHS; showCloseButton?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 animate-content-in rounded-shell bg-surface p-1.5 shadow-floating outline-none max-md:top-4",
          WIDTHS[size],
          className,
        )}
        {...props}
      >
        <div className="relative max-h-[80vh] overflow-y-auto rounded-shell bg-surface">{children}</div>
        {showCloseButton && (
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute top-5 right-5 grid size-8 place-items-center rounded-control text-fg-subtle transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none [&_svg]:size-4"
          >
            <X strokeWidth={1.5} />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-1.5 px-5 pt-5 pr-14", className)} {...props} />;
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-body" className={cn("px-5 pt-5 pb-5 text-body-sm text-fg", className)} {...props} />;
}

function DialogFooter({ className, divider = true, ...props }: React.ComponentProps<"div"> & { divider?: boolean }) {
  return <div data-slot="dialog-footer" className={cn("flex items-center justify-end gap-2 px-5", divider ? "border-t border-line-subtle py-3.5" : "pb-5", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-h5 leading-snug font-normal text-fg", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-body-sm text-fg-muted", className)} {...props} />;
}

export { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger };
