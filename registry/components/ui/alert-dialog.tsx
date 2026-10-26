"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { buttonVariants } from "@/components/ui/button";
import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A confirmation drawn as the dashboard's dialog (context-dashboard src/components/ui/dialog.tsx): a white panel in a
// 6px frame on a hairline and a soft shadow over the scrim, rising 4px as it fades in, held in the upper part of the
// window. The title is h5 at weight 400, the description muted body-sm, 20px in; the actions sit right-aligned over a
// light line, Cancel outlined and the action blue (outlined red when it destroys something, as the dashboard's danger
// zone does). `size="sm"` centers the title under an optional media tile and splits the footer in two. It has no close
// glyph and ignores clicks outside it: the person answers it (Escape cancels).
function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  const container = usePortalContainer();
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" container={container} {...props} />;
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={cn("fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-scrim px-4 pt-[12vh] pb-6 max-md:pt-4", className)} {...props} />;
}

const WIDTHS = { default: "max-w-lg", sm: "max-w-sm" } as const;

function AlertDialogContent({ className, children, size = "default", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content> & { size?: keyof typeof WIDTHS }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay>
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          data-size={size}
          className={cn("group/alert-dialog relative z-50 w-full shrink-0 animate-content-in rounded-shell bg-surface p-(--ds-space-frame) shadow-floating outline-none", WIDTHS[size], className)}
          {...props}
        >
          <div className="relative rounded-shell bg-surface">{children}</div>
        </AlertDialogPrimitive.Content>
      </AlertDialogOverlay>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-1.5 px-5 pt-5 pb-5 group-data-[size=sm]/alert-dialog:items-center group-data-[size=sm]/alert-dialog:text-center", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 border-t border-line-subtle px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end group-data-[size=sm]/alert-dialog:grid group-data-[size=sm]/alert-dialog:grid-cols-2 group-data-[size=sm]/alert-dialog:[&>*]:w-full", className)}
      {...props}
    />
  );
}

/** A 40px tile above a small dialog's title: a hairline square holding one 16px icon. */
function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-media" className={cn("mb-1.5 grid size-10 place-items-center rounded-control border border-line text-fg-muted [&_svg:not([class*='size-'])]:size-4", className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("text-h5 leading-snug font-normal tracking-normal text-fg", className)} {...props} />;
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn("text-body-sm text-fg-muted", className)} {...props} />;
}

const DESTRUCTIVE = "border-danger text-danger hover:border-danger hover:bg-danger/6";

function AlertDialogAction({ className, variant = "default", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action> & { variant?: "default" | "destructive" }) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonVariants({ variant: variant === "destructive" ? "outline" : "brand" }), variant === "destructive" && DESTRUCTIVE, className)}
      {...props}
    />
  );
}

function AlertDialogCancel({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={cn(buttonVariants({ variant: "outline" }), className)} {...props} />;
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
