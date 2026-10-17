"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight } from "lucide-react";

import { useHold } from "@/hooks/use-hold";
import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// The dashboard's menus: one panel whose 6px padding lets a hovered row's wash come close to the edge, roomy rows
// 10px in from the sides, section labels on the rows' grid, separators edge to edge. Destructive rows can require a
// hold (DropdownMenuHoldItem) so a stray click can't delete anything.
const ROW = "relative flex w-full cursor-default items-center gap-2 rounded-control px-2.5 py-1.5 text-body-sm leading-5 text-fg-muted outline-none select-none transition-colors duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-wash-hover data-[highlighted]:text-fg [&_svg]:size-3.5 [&_svg]:shrink-0";

function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({ className, sideOffset = 6, align = "end", ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal container={usePortalContainer()}>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn("z-50 flex min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) animate-pop-in flex-col gap-0.5 rounded-shell bg-surface p-1.5 shadow-floating outline-none", className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuItem({ className, variant = "default", ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { variant?: "default" | "destructive" }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(ROW, variant === "destructive" && "text-danger data-[highlighted]:bg-danger/5 data-[highlighted]:text-danger", className)}
      {...props}
    />
  );
}

/** A destructive row that fires only after being held, its fill running across as the hint. */
function DropdownMenuHoldItem({ holdMs = 1500, onConfirm, children, className, ...props }: Omit<React.ComponentProps<typeof DropdownMenuPrimitive.Item>, "onSelect"> & { holdMs?: number; onConfirm: () => void }) {
  const { isHolding, handlers } = useHold(holdMs, onConfirm);
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-hold-item"
      onSelect={(event) => event.preventDefault()}
      {...handlers}
      className={cn(ROW, "overflow-hidden text-danger data-[highlighted]:bg-danger/5 data-[highlighted]:text-danger", className)}
      {...props}
    >
      <span
        aria-hidden
        className={cn("absolute inset-0 origin-left bg-danger/10 transition-transform ease-linear motion-reduce:transition-none", isHolding ? "scale-x-100" : "scale-x-0 duration-150")}
        style={isHolding ? { transitionDuration: `${holdMs}ms` } : undefined}
      />
      <span className="relative flex flex-1 items-center gap-2">{isHolding ? "Keep holding…" : children}</span>
      <span className="relative ml-4 text-caption text-fg-subtle">Hold {holdMs / 1000}s</span>
    </DropdownMenuPrimitive.Item>
  );
}

function DropdownMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem data-slot="dropdown-menu-checkbox-item" checked={checked} className={cn(ROW, "pr-8", className)} {...props}>
      {children}
      <DropdownMenuPrimitive.ItemIndicator className="absolute right-2.5 text-brand">
        <Check strokeWidth={1.75} />
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem data-slot="dropdown-menu-radio-item" className={cn(ROW, "pr-8 data-[state=checked]:text-fg", className)} {...props}>
      {children}
      <DropdownMenuPrimitive.ItemIndicator className="absolute right-2.5 text-brand">
        <Check strokeWidth={1.75} />
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" className={cn("px-2.5 pt-1 pb-1.5 text-caption text-fg-subtle", className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("-mx-1.5 my-1 h-px bg-line-subtle", className)} {...props} />;
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="dropdown-menu-shortcut" className={cn("ml-auto text-caption text-fg-subtle", className)} {...props} />;
}

function DropdownMenuSub(props: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>) {
  return (
    <DropdownMenuPrimitive.SubTrigger data-slot="dropdown-menu-sub-trigger" className={cn(ROW, "data-[state=open]:bg-wash-hover", className)} {...props}>
      {children}
      <ChevronRight className="ml-auto" strokeWidth={1.5} />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal container={usePortalContainer()}>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn("z-50 flex min-w-40 origin-(--radix-dropdown-menu-content-transform-origin) animate-pop-in flex-col gap-0.5 rounded-shell bg-surface p-1.5 shadow-floating", className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuHoldItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
