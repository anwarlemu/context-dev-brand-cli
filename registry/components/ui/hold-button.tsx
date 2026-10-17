"use client";

import * as React from "react";

import { useHold } from "@/hooks/use-hold";
import { cn } from "@/lib/utils";

// Hold to confirm a destructive action: an outlined red button that fills red while held. The fill carries a white copy
// of the label and is revealed by clip-path from the left, so the label reads red on white ahead of the fill and white
// on red behind it at every moment (the site's version turned the whole label white at once, leaving it white on white
// until the fill arrived). The reveal runs at a constant rate while held and snaps back in 150ms ease-out on release.
function HoldButton({ label, onConfirm, holdMs = 1200, className }: { label: string; onConfirm: () => void; holdMs?: number; className?: string }) {
  const { isHolding, handlers } = useHold(holdMs, onConfirm);
  const text = isHolding ? "Keep holding…" : label;
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
      <span>{text}</span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-danger text-white transition-[clip-path] motion-reduce:transition-none",
          isHolding ? "[clip-path:inset(0_0_0_0)] ease-linear" : "[clip-path:inset(0_100%_0_0)] duration-150 ease-out",
        )}
        style={isHolding ? { transitionDuration: `${holdMs}ms` } : undefined}
      >
        {text}
      </span>
    </button>
  );
}

export { HoldButton };
