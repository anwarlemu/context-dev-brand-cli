"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A right-click menu drawn as the dashboard's menus (the dropdown menu): one panel with shell corners in a 6px frame on
// a hairline and a soft shadow, roomy rows 10px in from its sides in muted body-sm that wash and darken under the
// pointer, 14px icons at stroke 1.5, section labels in caption, separators edge to edge, shortcuts in caption at the
// right, destructive rows red. The panel grows out of the pointer's corner in a short pop; moving the highlight is
// instant (it is used by keyboard and many times a day).
const PANEL = "ds-scrollbar z-50 flex max-h-(--radix-context-menu-content-available-height) min-w-48 origin-(--radix-context-menu-content-transform-origin) animate-pop-in flex-col gap-0.5 overflow-y-auto rounded-shell bg-surface p-(--ds-space-frame) shadow-floating outline-none [&>*]:shrink-0";
const ROW = "relative flex w-full cursor-default items-center gap-2 rounded-control px-2.5 py-1.5 text-body-sm leading-5 text-fg-muted outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-wash-hover data-[highlighted]:text-fg data-[inset]:pl-8 [&_svg]:size-3.5 [&_svg]:shrink-0";
const DESTRUCTIVE = "text-danger data-[highlighted]:bg-danger/6 data-[highlighted]:text-danger";

function ContextMenu(props: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger(props: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />;
}

function ContextMenuGroup(props: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuPortal(props: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" container={usePortalContainer()} {...props} />;
}

function ContextMenuSub(props: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup(props: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

function ContextMenuContent({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.Content data-slot="context-menu-content" collisionPadding={8} className={cn(PANEL, className)} {...props} />
    </ContextMenuPortal>
  );
}

function ContextMenuItem({ className, inset, variant = "default", ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return <ContextMenuPrimitive.Item data-slot="context-menu-item" data-inset={inset || undefined} data-variant={variant} className={cn(ROW, variant === "destructive" && DESTRUCTIVE, className)} {...props} />;
}

function ContextMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.SubTrigger data-slot="context-menu-sub-trigger" data-inset={inset || undefined} className={cn(ROW, "data-[state=open]:bg-wash-hover data-[state=open]:text-fg", className)} {...props}>
      {children}
      <ChevronRight className="ml-auto" strokeWidth={1.5} />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.SubContent data-slot="context-menu-sub-content" collisionPadding={8} className={cn(PANEL, "min-w-40", className)} {...props} />
    </ContextMenuPortal>
  );
}

function ContextMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem data-slot="context-menu-checkbox-item" checked={checked} className={cn(ROW, "pr-8", className)} {...props}>
      {children}
      <ContextMenuPrimitive.ItemIndicator className="absolute right-2.5 text-brand">
        <Check strokeWidth={1.75} />
      </ContextMenuPrimitive.ItemIndicator>
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem data-slot="context-menu-radio-item" className={cn(ROW, "pr-8 data-[state=checked]:text-fg", className)} {...props}>
      {children}
      <ContextMenuPrimitive.ItemIndicator className="absolute right-3 text-brand">
        <Circle className="size-2! fill-current" strokeWidth={0} />
      </ContextMenuPrimitive.ItemIndicator>
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
  return <ContextMenuPrimitive.Label data-slot="context-menu-label" data-inset={inset || undefined} className={cn("px-2.5 pt-1 pb-1.5 text-caption text-fg-subtle data-[inset]:pl-8", className)} {...props} />;
}

function ContextMenuSeparator({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return <ContextMenuPrimitive.Separator data-slot="context-menu-separator" className={cn("-mx-1.5 my-1 h-px bg-line-subtle", className)} {...props} />;
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="context-menu-shortcut" className={cn("ml-auto pl-4 text-caption text-fg-subtle", className)} {...props} />;
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
