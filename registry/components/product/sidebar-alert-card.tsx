"use client";

import * as React from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

// The card's fill, edge and text in each tone, deepening its edge on hover (the dashboard's sidebar status card,
// src/components/sidebar-status-card.tsx). Neutral is the quiet one: a gray card with the action in brand blue.
const TONES = {
  danger: "border-danger-line bg-danger-soft text-danger-strong hover:border-danger-strong/50",
  warning: "border-warning-line bg-warning-soft text-warning-strong hover:border-warning-strong/50",
  neutral: "border-line bg-neutral-5 text-fg-muted hover:border-line-strong hover:bg-wash-pill",
} as const;

// A plan or billing notice at the foot of the sidebar, above Help: the whole card is the fix. A short title in the
// tone's color (a still dot before it on danger and warning, credits left after it when given), one line in body text,
// then the action with its arrow: up and right out to billing, or turning back to resume a plan that is ending. The
// icon never moves; while the action runs it goes and the words fade back. Hidden while the sidebar shows the
// playground's APIs.
function SidebarAlertCard({
  tone = "danger",
  tag,
  message,
  action,
  pendingAction,
  pending = false,
  icon = tone === "warning" ? "resume" : "external",
  remainingCredits,
  onClick,
  className,
  "aria-label": ariaLabel,
}: {
  tone?: keyof typeof TONES;
  /** The title: "Payment failed", "3 days left", "Free plan". */
  tag: React.ReactNode;
  /** One line under the title ("Update your card."); leave it out for a one-line card. */
  message?: React.ReactNode;
  action: React.ReactNode;
  /** The action's words while it runs ("Opening..."). */
  pendingAction?: React.ReactNode;
  pending?: boolean;
  icon?: "external" | "resume";
  /** Credits left, shown at the end of the title row ("124 left"). */
  remainingCredits?: number;
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
}) {
  const Icon = icon === "resume" ? RotateCcw : ArrowUpRight;
  return (
    <button
      type="button"
      data-slot="sidebar-alert-card"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending || undefined}
      aria-label={ariaLabel}
      className={cn(
        "flex w-full flex-col gap-1 rounded-card border p-2.5 text-left text-caption transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:outline-solid disabled:cursor-wait motion-reduce:transition-none",
        TONES[tone],
        className,
      )}
    >
      <span className="flex w-full items-center gap-1.5 whitespace-nowrap">
        {tone !== "neutral" && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-pill bg-current" />}
        <span>{tag}</span>
        {remainingCredits !== undefined && (
          <span className="ml-auto flex shrink-0 items-baseline gap-1 text-fg-muted tabular-nums">
            {remainingCredits.toLocaleString("en-US")} left
          </span>
        )}
      </span>
      {message && <span className="whitespace-nowrap text-fg">{message}</span>}
      <span className={cn("flex items-center gap-0.5 whitespace-nowrap", tone === "neutral" && "text-fg-brand", pending && "opacity-55")}>
        {pending && pendingAction ? pendingAction : action}
        {!pending && <Icon aria-hidden="true" className="size-3 shrink-0" />}
      </span>
    </button>
  );
}

export { SidebarAlertCard };
