import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The product's small outlined label (status shown by a 6px dot and the word), and the site's hairline chip.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "h-5 rounded-sm border border-line bg-transparent px-2 text-caption text-fg-muted",
        // Status: outlined gray like the rest; the color is a 6px dot and the status word.
        brand: "h-5 rounded-sm border border-line bg-transparent px-2 text-caption text-fg-brand before:size-1.5 before:rounded-pill before:bg-brand",
        success: "h-5 rounded-sm border border-line bg-transparent px-2 text-caption text-success before:size-1.5 before:rounded-pill before:bg-success",
        warning: "h-5 rounded-sm border border-line bg-transparent px-2 text-caption text-warning before:size-1.5 before:rounded-pill before:bg-warning",
        destructive: "h-5 rounded-sm border border-line bg-transparent px-2 text-caption text-danger before:size-1.5 before:rounded-pill before:bg-danger",
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
