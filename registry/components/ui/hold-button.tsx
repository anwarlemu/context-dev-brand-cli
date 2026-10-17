"use client";

import * as React from "react";

import { useHold } from "@/hooks/use-hold";
import { cn } from "@/lib/utils";

// Hold to confirm a destructive action: an outlined red button whose fill runs across while held.
function HoldButton({ label, onConfirm, holdMs = 1500, className }: { label: string; onConfirm: () => void; holdMs?: number; className?: string }) {
  const { isHolding, handlers } = useHold(holdMs, onConfirm);
  return (
    <button
      type="button"
      data-slot="hold-button"
      {...handlers}
      className={cn(
        "relative inline-flex h-8 items-center overflow-hidden rounded-control border border-danger px-3.5 text-body-sm text-danger outline-none select-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-0 origin-left bg-danger/10 transition-transform ease-linear motion-reduce:transition-none", isHolding ? "scale-x-100" : "scale-x-0 duration-150")}
        style={isHolding ? { transitionDuration: `${holdMs}ms` } : undefined}
      />
      <span className="relative">{isHolding ? "Keep holding…" : label}</span>
    </button>
  );
}

export { HoldButton };
