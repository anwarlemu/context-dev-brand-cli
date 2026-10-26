import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A notice in the flow of a page, drawn as the dashboard's page banner (banner.tsx): card corners, a light edge, 16px
// of side padding, a medium title over muted text, a 16px line glyph beside them in the tone's color and an action at
// the end. `default` sits on the card's white with its hairline, `info` on blue 10 (news), `warning` on the soft amber
// with its amber line, `destructive` on the soft red of the banner's alert. The same tokens hold on the site, where
// text-body-sm is 14px, and in the product's dark theme.
const alertVariants = cva(
  "group/alert relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2.5 gap-y-0.5 rounded-card border px-4 py-3 text-body-sm leading-relaxed text-fg has-[>svg]:grid-cols-[auto_minmax(0,1fr)_auto] [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-line bg-surface [&>svg]:text-fg-subtle",
        info: "border-line bg-blue-10 [&>svg]:text-fg-brand",
        warning: "border-warning-line bg-warning-soft [&>svg]:text-warning",
        destructive: "border-alert/30 bg-alert/6 [&>svg]:text-alert-strong [&>[data-slot=alert-title]]:text-danger-strong",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" data-variant={variant ?? "default"} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("col-start-1 min-w-0 font-medium group-has-[>svg]/alert:col-start-2", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("col-start-1 min-w-0 text-fg-muted group-has-[>svg]/alert:col-start-2 [&_a]:text-fg-brand [&_a]:underline [&_a]:underline-offset-4 [&_p]:leading-relaxed", className)} {...props} />;
}

/** What sits at the end of a notice: a button or a quiet note, centered against the title and description. */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-action" className={cn("col-start-2 row-span-2 row-start-1 flex shrink-0 items-center gap-2 self-center group-has-[>svg]/alert:col-start-3", className)} {...props} />;
}

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants };
