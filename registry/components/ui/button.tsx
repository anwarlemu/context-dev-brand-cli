import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// One button for both surfaces. The product's controls (brand blue for the one main action, black, outline, ghost,
// danger) keep shadcn's variant names so an app's shadcn buttons swap in as is; the site's pills are their own
// variants. Sizes follow the surface through the tokens (.ds-product makes text and radius compact).
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-normal transition-[background-color,border-color,color,scale] duration-150 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "rounded-control bg-brand text-on-brand hover:bg-blue-90",
        black: "rounded-control bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "rounded-control border border-line-strong bg-transparent text-fg hover:border-fg",
        secondary: "rounded-control bg-subtle text-fg hover:bg-wash-pill",
        ghost: "rounded-control bg-transparent text-fg-subtle hover:bg-wash-hover hover:text-fg",
        destructive: "rounded-control border border-danger bg-transparent text-danger hover:bg-danger/5",
        link: "h-auto rounded-none px-0 text-fg-brand underline-offset-4 hover:underline active:scale-100",
        pill: "rounded-pill border border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover",
        "pill-outline": "rounded-pill border border-brand bg-surface text-fg-brand hover:bg-tint",
        "pill-on-brand": "rounded-pill border border-white bg-transparent text-white hover:bg-ring-on-brand",
      },
      size: {
        default: "h-8 px-3.5 text-body-sm",
        sm: "h-7 px-2.5 text-caption",
        lg: "h-10 px-4 text-body-sm",
        icon: "size-8 px-0",
        "icon-sm": "size-7 px-0",
        "icon-lg": "size-10 px-0",
      },
    },
    compoundVariants: [
      // The site's pills are sized by their padding, at body size, as on the brand's pages.
      { variant: ["pill", "pill-outline", "pill-on-brand"], size: "default", className: "h-auto px-5 py-3 text-body leading-snug" },
      { variant: ["pill", "pill-outline", "pill-on-brand"], size: "sm", className: "h-auto px-4 py-2 text-body-sm leading-snug" },
      { variant: ["pill", "pill-outline", "pill-on-brand"], size: "lg", className: "h-auto px-6 py-3.5 text-body-lg leading-snug" },
      { variant: "ghost", size: ["icon", "icon-sm", "icon-lg"], className: "text-fg-subtle" },
    ],
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
