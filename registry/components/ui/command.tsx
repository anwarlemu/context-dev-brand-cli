"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// The dashboard's command palette (ShellCommandPalette): a search field over grouped destinations, 36px rows in the
// menu style, keyboard hints along the bottom. It opens from the keyboard many times a day, so it appears at once with
// no animation; the page dims a touch behind it, never blurs.
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive data-slot="command" className={cn("flex size-full flex-col overflow-hidden rounded-card bg-surface text-fg", className)} {...props} />;
}

function CommandDialog({ title = "Command palette", description = "Search for a page or an action", children, ...props }: React.ComponentProps<typeof Dialog> & { title?: string; description?: string }) {
  return (
    <Dialog {...props}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim" />
        <DialogPrimitive.Content
          data-slot="command-dialog"
          className="fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-card bg-surface shadow-[0_0_0_1px_var(--ds-color-border-hairline),0_24px_64px_rgb(0_0_0/0.16)] outline-none"
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
          <Command>{children}</Command>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="flex items-center gap-3 border-b border-line-subtle px-4">
      <Search className="size-4 shrink-0 text-fg-subtle" strokeWidth={1.5} />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn("h-12 flex-1 bg-transparent text-body-sm text-fg outline-none placeholder:text-fg-subtle disabled:opacity-50", className)}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List data-slot="command-list" className={cn("max-h-[52vh] scroll-py-1.5 overflow-x-hidden overflow-y-auto p-1.5", className)} {...props} />;
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={cn("px-3 py-8 text-center text-body-sm text-fg-subtle", className)} {...props} />;
}

// Group headings in small mono, on the rows' grid.
function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn("pb-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-axis [&_[cmdk-group-heading]]:text-fg-subtle", className)}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={cn("-mx-1.5 my-1 h-px bg-line-subtle", className)} {...props} />;
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex h-9 cursor-default items-center gap-3 rounded-control px-3 text-body-sm text-fg-muted outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[selected=true]:bg-wash-hover data-[selected=true]:text-fg [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="command-shortcut" className={cn("ml-auto flex items-center gap-1 text-caption text-fg-subtle", className)} {...props} />;
}

// The row of keyboard hints under the list.
function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command-footer" className={cn("flex items-center gap-4 border-t border-line-subtle px-4 py-2.5 text-caption text-fg-subtle [&>span]:flex [&>span]:items-center [&>span]:gap-1.5", className)} {...props} />;
}

export { Command, CommandDialog, CommandEmpty, CommandFooter, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut };
