import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Never a blank page, as the dashboard's empty state (empty-state.tsx, monitors-home): centered in its column, the
// media (a GlyphTile: the 64px bordered square, or the 112px ringed story on a product's first visit), the title at h4
// in 450 weight, one balanced muted line at most 480px wide, then the next actions with the brand button first and
// anything quieter under them. `outline` draws a dashed hairline box around it for an empty panel inside a page.
// Nothing moves except the glyph's own loop.
const emptyVariants = cva("flex min-w-0 flex-1 flex-col items-center justify-center px-8 pt-8 pb-10 text-center", {
  variants: {
    variant: {
      default: "",
      outline: "rounded-card border border-dashed border-line-strong",
    },
  },
  defaultVariants: { variant: "default" },
});

function Empty({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof emptyVariants>) {
  return <div data-slot="empty" data-variant={variant ?? "default"} className={cn(emptyVariants({ variant }), className)} {...props} />;
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-header" className={cn("flex max-w-120 flex-col items-center", className)} {...props} />;
}

// `default` holds a GlyphTile (or any art) as it is; `icon` is the glyph tile's frame for a plain mark: a 64px square
// with control corners, a hairline edge and the mark in brand blue.
const emptyMediaVariants = cva("mb-6 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "size-16 rounded-control border border-line bg-surface text-fg-brand [&_svg:not([class*='size-'])]:size-7",
    },
  },
  defaultVariants: { variant: "default" },
});

function EmptyMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return <div data-slot="empty-media" data-variant={variant} className={cn(emptyMediaVariants({ variant }), className)} {...props} />;
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-title" className={cn("text-h4 leading-snug font-[450] tracking-normal text-balance text-fg", className)} {...props} />;
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="empty-description" className={cn("mt-1 max-w-120 text-body-sm text-balance text-fg-muted [&>a]:text-fg-brand [&>a]:underline [&>a]:underline-offset-4", className)} {...props} />;
}

/** The next actions (the brand button first), then anything quieter under them, such as a usage line. */
function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-content" className={cn("mt-5 flex w-full max-w-120 min-w-0 flex-col items-center gap-6 text-body-sm text-balance text-fg-subtle", className)} {...props} />;
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle };
