import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The product's small bordered label, its status tones, and the site's hairline chip.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "h-5 rounded-sm border border-line bg-transparent px-2 text-caption text-fg-muted",
        brand: "h-5 rounded-sm border border-transparent bg-tint px-2 text-caption text-fg-brand",
        success: "h-5 rounded-sm border border-transparent bg-success/10 px-2 text-caption text-success",
        warning: "h-5 rounded-sm border border-transparent bg-warning/10 px-2 text-caption text-warning",
        destructive: "h-5 rounded-sm border border-transparent bg-danger/10 px-2 text-caption text-danger",
        secondary: "h-5 rounded-sm border border-transparent bg-subtle px-2 text-caption text-fg-muted",
        outline: "h-5 rounded-sm border border-line-strong bg-transparent px-2 text-caption text-fg",
        chip: "rounded-pill bg-transparent px-3 py-1 text-body-sm text-fg-nav ring-1 ring-hairline ring-inset",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
