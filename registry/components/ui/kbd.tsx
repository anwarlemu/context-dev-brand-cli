import * as React from "react";

import { cn } from "@/lib/utils";

// A keyboard key in menus and the command palette: 20px, a light border on white, 11px.
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn("inline-grid h-5 min-w-5 place-items-center rounded-[calc(var(--ds-radius-control)-0.125rem)] border border-line bg-surface px-1 font-sans text-axis text-fg-subtle", className)}
      {...props}
    />
  );
}

export { Kbd };
