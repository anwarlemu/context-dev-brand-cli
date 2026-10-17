"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Grows from nothing to its content's height and back (300ms ease-out on the grid's rows, with a fade), so whatever
 * sits below glides rather than jumps. Stays mounted while closed (inert, so nothing inside takes focus), and clips only
 * until it has fully opened, so menus inside can still spill out of it. Reduced motion opens and closes at once.
 */
function Collapse({ open, id, className, children }: { open: boolean; id?: string; className?: string; children: React.ReactNode }) {
  const [isFullyOpen, setFullyOpen] = React.useState(open);
  if (!open && isFullyOpen) setFullyOpen(false);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (open && event.target === event.currentTarget && event.propertyName === "grid-template-rows") setFullyOpen(true);
  };

  return (
    <div
      id={id}
      data-slot="collapse"
      data-state={open ? "open" : "closed"}
      inert={!open}
      onTransitionEnd={handleTransitionEnd}
      className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
    >
      <div className={cn("min-h-0", !isFullyOpen && "overflow-hidden", open && "motion-reduce:overflow-visible")}>
        <div className={className}>{children}</div>
      </div>
    </div>
  );
}

export { Collapse };
