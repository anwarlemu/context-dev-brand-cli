import * as React from "react";

import { cn } from "@/lib/utils";

// A keyboard key in menus and the command palette.
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-line px-1 font-sans text-caption text-fg-subtle", className)}
      {...props}
    />
  );
}

export { Kbd };
