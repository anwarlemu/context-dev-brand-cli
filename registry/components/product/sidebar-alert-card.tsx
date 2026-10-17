"use client";

import * as React from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

const TONES = {
  danger: {
    card: "border-danger/30 bg-danger/4 hover:border-danger/50 hover:bg-danger/7",
    text: "text-danger",
    dot: "bg-danger",
    ping: "bg-danger/60",
  },
  warning: {
    card: "border-warning/30 bg-warning/5 hover:border-warning/50 hover:bg-warning/8",
    text: "text-warning",
    dot: "bg-warning",
    ping: "bg-warning/60",
  },
} as const;

// A billing problem at the foot of the sidebar, above Help: the whole card is the fix. A pulsing dot and a short tag
// in the tone's color ("Last payment failed", "3 days left"), one line in body text, then the action with its arrow,
// which nudges on hover. Danger for a failed payment (the arrow goes up and right, out to billing); warning for a plan
// that is ending (the arrow turns back, resuming it). Hidden while the sidebar shows the playground's APIs.
function SidebarAlertCard({
  tone = "danger",
  tag,
  message,
  action,
  pendingAction,
  pending = false,
  icon = tone === "danger" ? "external" : "resume",
  onClick,
  className,
}: {
  tone?: keyof typeof TONES;
  tag: React.ReactNode;
  message: React.ReactNode;
  action: React.ReactNode;
  /** The action's words while it runs ("Opening..."). */
  pendingAction?: React.ReactNode;
  pending?: boolean;
  icon?: "external" | "resume";
  onClick?: () => void;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <button
      type="button"
      data-slot="sidebar-alert-card"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "group mb-2 flex w-full flex-col gap-1 rounded-card border px-3 py-2.5 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-70",
        t.card,
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden className="relative flex size-1.5 shrink-0">
          <span className={cn("absolute inline-flex size-full animate-ping rounded-pill [animation-duration:2s] motion-reduce:hidden", t.ping)} />
          <span className={cn("relative inline-flex size-1.5 rounded-pill", t.dot)} />
        </span>
        <span className={cn("text-caption", t.text)}>{tag}</span>
      </span>
      <span className="text-body-sm text-fg">{message}</span>
      <span className={cn("flex items-center text-caption", icon === "external" ? "gap-0.5" : "gap-1", t.text)}>
        {pending && pendingAction ? pendingAction : action}
        {icon === "external" ? (
          <ArrowUpRight className="size-3 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" />
        ) : (
          <RotateCcw className="size-3 transition-transform duration-150 ease-out group-hover:-rotate-45 motion-reduce:transition-none" />
        )}
      </span>
    </button>
  );
}

export { SidebarAlertCard };
