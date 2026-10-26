import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// A row of content, as the dashboard lays out its settings rows and lists (settings-section.tsx, the sidebar's links):
// a 16px line glyph or a GlyphTile at the start, a body-sm title in ink over a muted description, actions at the end.
// `default` is bare and, as a link or button, washes on hover like a sidebar link; `outline` is the card with its
// hairline drawn into the shadow; `muted` sits on the subtle gray. A selected item (aria-current or data-selected)
// takes the sidebar's selected wash. ItemGroup stacks them with a light rule between (divide-line-subtle).
function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="list" data-slot="item-group" className={cn("group/item-group flex flex-col", className)} {...props} />;
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="item-separator" orientation="horizontal" className={cn("my-0", className)} {...props} />;
}

const itemVariants = cva(
  "group/item flex flex-wrap items-center rounded-control text-body-sm text-fg outline-none transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring aria-[current=page]:bg-wash-selected aria-[current=true]:bg-wash-selected data-[selected=true]:bg-wash-selected motion-reduce:transition-none [a]:hover:bg-wash-hover [button]:hover:bg-wash-hover",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "rounded-card bg-surface shadow-card [a]:hover:bg-subtle [button]:hover:bg-subtle",
        muted: "rounded-card bg-subtle",
      },
      size: {
        default: "gap-3 px-4 py-3",
        sm: "min-h-8 gap-2.5 px-3 py-1.5",
        xs: "gap-2 px-2 py-1 text-caption",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Item({ className, variant = "default", size = "default", asChild = false, ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return <Comp data-slot="item" data-variant={variant} data-size={size} className={cn(itemVariants({ variant, size, className }))} {...props} />;
}

// `icon` is the sidebar's 16px glyph at stroke 1.75 in the subtle gray; `image` a 40px picture or GlyphTile with control
// corners.
const itemMediaVariants = cva("flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none", {
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "text-fg-subtle group-has-data-[slot=item-description]/item:mt-0.5 [&_svg:not([class*='size-'])]:size-4",
      image: "size-10 overflow-hidden rounded-control [&_img]:size-full [&_img]:object-cover",
    },
  },
  defaultVariants: { variant: "default" },
});

function ItemMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return <div data-slot="item-media" data-variant={variant} className={cn(itemMediaVariants({ variant, className }))} {...props} />;
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-content" className={cn("flex min-w-0 flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none", className)} {...props} />;
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-title" className={cn("flex w-fit min-w-0 items-center gap-2 leading-snug text-fg", className)} {...props} />;
}

/** The muted line under a title, clamped to two lines. */
function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="item-description" className={cn("line-clamp-2 leading-relaxed font-normal text-balance text-fg-muted [&>a]:text-fg-brand [&>a]:underline [&>a]:underline-offset-4", className)} {...props} />;
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-actions" className={cn("flex items-center gap-2", className)} {...props} />;
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-header" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />;
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-footer" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />;
}

export { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle };
