import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A marker in a conversation or a list, in the dashboard's quiet caption: 12px in the subtle gray, as the support
// chat's "We're here to help". `separator` centers it between two light rules ("Today"), `border` rules it underneath,
// and `unread` draws the rules in brand blue where unread messages begin.
const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-caption leading-snug text-fg-subtle [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [a]:underline [a]:underline-offset-4 [a]:hover:text-fg",
  {
    variants: {
      variant: {
        default: "",
        separator: "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-line-subtle after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-line-subtle",
        border: "border-b border-line-subtle pb-2",
        unread: "text-fg-brand before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-brand after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-brand",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Marker({ className, variant = "default", asChild = false, ...props }: React.ComponentProps<"div"> & VariantProps<typeof markerVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return <Comp data-slot="marker" data-variant={variant} role={variant === "default" ? undefined : "separator"} className={cn(markerVariants({ variant }), className)} {...props} />;
}

function MarkerIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="marker-icon" aria-hidden="true" className={cn("inline-flex size-3.5 shrink-0 items-center justify-center", className)} {...props} />;
}

function MarkerContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="marker-content" className={cn("min-w-0 [overflow-wrap:anywhere] group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center group-data-[variant=unread]/marker:flex-none *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-fg", className)} {...props} />;
}

export { Marker, MarkerContent, MarkerIcon, markerVariants };
