import * as React from "react";

import { cn } from "@/lib/utils";

// The dashboard's skeleton: a pale block with a sheen sliding across it on transform (constant motion, so linear); with
// reduced motion, the block alone.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-[calc(var(--ds-radius-control)-0.125rem)] bg-neutral-5 after:absolute after:inset-0 after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-skeleton-shine after:to-transparent after:[animation-duration:1.4s] after:[animation-timing-function:linear] motion-reduce:after:hidden",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
