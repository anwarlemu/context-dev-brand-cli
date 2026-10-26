"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A pressed-or-not key, in the button's terms (the dashboard's ghost and outline buttons, control corners, body-sm): off
// it reads muted and washes gray under the pointer; on it holds the pill wash with ink text. `outline` adds the strong
// hairline, which turns ink when on. A press scales it to 97 percent; the state change itself is color only.
const toggleVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-control text-body-sm whitespace-nowrap text-fg-muted outline-none select-none transition-[color,background-color,border-color,scale] duration-150 ease-out hover:text-fg active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:text-danger data-[state=on]:text-fg motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-wash-hover data-[state=on]:bg-wash-pill",
        outline: "border border-line-strong bg-transparent hover:border-fg data-[state=on]:border-fg data-[state=on]:bg-wash-hover",
      },
      size: {
        default: "h-8 min-w-8 px-2.5",
        sm: "h-7 min-w-7 px-2 text-caption",
        lg: "h-10 min-w-10 px-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Toggle({ className, variant, size, ...props }: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ variant, size, className }))} {...props} />;
}

export { Toggle, toggleVariants };
