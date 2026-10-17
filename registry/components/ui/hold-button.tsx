"use client";

import * as React from "react";

import { useHold } from "@/hooks/use-hold";
import { cn } from "@/lib/utils";

// Hold to confirm a destructive action: an outlined red button that fills red while held, its label turning white.
// The fill runs at a constant rate while held and snaps back in 150ms ease-out on release.
function HoldButton({ label, onConfirm, holdMs = 1200, className }: { label: string; onConfirm: () => void; holdMs?: number; className?: string }) {
  const { isHolding, handlers } = useHold(holdMs, onConfirm);
  return (
    <button
      type="button"
      data-slot="hold-button"
      {...handlers}
      className={cn(
        "relative inline-flex h-8 shrink-0 items-center justify-center overflow-hidden rounded-control border border-danger px-3.5 text-body-sm whitespace-nowrap text-danger outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-0 origin-left bg-danger transition-transform motion-reduce:transition-none", isHolding ? "scale-x-100 ease-linear" : "scale-x-0 duration-150 ease-out")}
        style={isHolding ? { transitionDuration: `${holdMs}ms` } : undefined}
      />
      <span className={cn("relative transition-colors duration-150 ease-out", isHolding && "text-white")}>{isHolding ? "Keep holding…" : label}</span>
    </button>
  );
}

export { HoldButton };
