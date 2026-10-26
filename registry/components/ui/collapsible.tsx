"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { Collapse } from "@/components/ui/collapse";
import { cn } from "@/lib/utils";

// A section that opens in place, with shadcn's API (open, defaultOpen, onOpenChange, disabled, a trigger and its
// content) on the library's Collapse: the content grows from nothing to its height and back (300ms ease-out on the
// grid's rows, with a fade), so what sits below glides rather than jumps; it stays mounted while closed (inert) and
// clips only until fully open, so a menu inside can spill out; reduced motion opens and closes at once. The trigger is
// unstyled: give it the row it sits in (the playground's advanced parameters, a monitor's details).
type CollapsibleContextValue = { open: boolean; toggle: () => void; contentId: string; disabled?: boolean };
const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsible() {
  const context = React.useContext(CollapsibleContext);
  if (!context) throw new Error("Collapsible parts must be inside a Collapsible.");
  return context;
}

function Collapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled,
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"div"> & { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean; asChild?: boolean }) {
  const [inner, setInner] = React.useState(defaultOpen);
  const open = openProp ?? inner;
  const contentId = React.useId();
  const toggle = React.useCallback(() => {
    const next = !open;
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  }, [open, openProp, onOpenChange]);
  const Comp = asChild ? Slot : "div";
  return (
    <CollapsibleContext.Provider value={{ open, toggle, contentId, disabled }}>
      <Comp data-slot="collapsible" data-state={open ? "open" : "closed"} data-disabled={disabled || undefined} className={className} {...props} />
    </CollapsibleContext.Provider>
  );
}

function CollapsibleTrigger({ asChild = false, onClick, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { open, toggle, contentId, disabled } = useCollapsible();
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="collapsible-trigger"
      type={asChild ? undefined : "button"}
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? "open" : "closed"}
      data-disabled={disabled || undefined}
      disabled={disabled}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      {...props}
    />
  );
}

function CollapsibleContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, contentId } = useCollapsible();
  return (
    <div data-slot="collapsible-content" data-state={open ? "open" : "closed"}>
      <Collapse open={open} id={contentId} className={cn(className)}>
        {children}
      </Collapse>
    </div>
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
