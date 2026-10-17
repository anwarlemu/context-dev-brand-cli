import * as React from "react";

import { cn } from "@/lib/utils";

// A pale block with a slow sheen passing over it; with reduced motion, the block alone.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-control bg-neutral-5 after:absolute after:inset-0 after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-neutral-10 after:to-transparent motion-reduce:after:hidden",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
