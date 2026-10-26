"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

// Toggles joined into one control, as the segmented control draws it (form.tsx SegmentedControl, `segmented`): a pale
// gray track with control corners and a 2px inset; each choice is muted body-sm, and the pressed ones are white keys with
// the segmented pill's soft drop. With `spacing={0}` the choices sit flush. `variant="outline"` drops the track: joined
// outline keys with a shared edge. Choosing is instant (no gliding key): unlike the segmented control's single value,
// several can be on at once.
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants> & { spacing?: number; orientation?: "horizontal" | "vertical" }>({
  size: "default",
  variant: "default",
  spacing: 0.5,
  orientation: "horizontal",
});

const INNER_RADIUS = "rounded-[calc(var(--ds-radius-control)-0.125rem)]";

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  spacing,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants> & { spacing?: number; orientation?: "horizontal" | "vertical" }) {
  const gap = spacing ?? (variant === "outline" ? 0 : 0.5);
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={gap}
      data-orientation={orientation}
      orientation={orientation}
      style={{ "--gap": gap } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit max-w-full items-center gap-[calc(var(--spacing)*var(--gap))] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        variant === "default" && "overflow-x-auto rounded-control bg-neutral-5 p-0.5 [scrollbar-width:none]",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing: gap, orientation }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({ className, children, variant, size, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);
  const v = context.variant || variant || "default";
  const flush = context.spacing === 0;
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={v}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({ variant: v, size: context.size || size }),
        // In the track the pressed choice is the white key, as in the segmented control.
        v === "default" && cn(INNER_RADIUS, "hover:bg-transparent data-[state=on]:bg-surface data-[state=on]:shadow-[0_1px_3px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.03)]"),
        // Joined outline keys share their edges and square their inner corners.
        v === "outline" && flush && "group-data-[orientation=horizontal]/toggle-group:not-first:-ml-px group-data-[orientation=horizontal]/toggle-group:not-first:rounded-l-none group-data-[orientation=horizontal]/toggle-group:not-last:rounded-r-none group-data-[orientation=vertical]/toggle-group:not-first:-mt-px group-data-[orientation=vertical]/toggle-group:not-first:rounded-t-none group-data-[orientation=vertical]/toggle-group:not-last:rounded-b-none data-[state=on]:z-10",
        "focus-visible:z-20",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
