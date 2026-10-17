"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The product's tabs: plain labels, the selected one on a soft gray pill with no border. The site's: pills, the
// selected one outlined in brand blue. Only the text answers a hover.
const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap outline-none transition-[background-color,border-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-focus-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "h-9 rounded-control px-4 text-body-sm text-fg-subtle hover:text-fg data-[state=active]:bg-wash-pill data-[state=active]:text-fg",
        pill: "rounded-pill border border-transparent px-5 py-2.5 text-body text-fg-muted hover:bg-tint data-[state=active]:border-brand data-[state=active]:bg-surface data-[state=active]:text-fg-brand",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const TabsVariant = React.createContext<VariantProps<typeof tabsTriggerVariants>["variant"]>("default");

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />;
}

function TabsList({ className, variant = "default", ...props }: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsTriggerVariants>) {
  return (
    <TabsVariant.Provider value={variant}>
      <TabsPrimitive.List data-slot="tabs-list" className={cn("inline-flex w-fit items-center", variant === "pill" ? "gap-2" : "gap-1", className)} {...props} />
    </TabsVariant.Provider>
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = React.useContext(TabsVariant);
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn(tabsTriggerVariants({ variant }), className)} {...props} />;
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsTriggerVariants };
