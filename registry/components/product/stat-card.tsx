import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

// The dashboard's stat card: a caption title at the top, the figure (22px medium, tabular) in the middle, a quiet line
// at the foot. Given onClick or href (via asChild), the whole card is the action, with an arrow that nudges on hover
// and the translucent blue ring around the card.
function StatCard({
  title,
  footer,
  interactive = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & { title: React.ReactNode; footer?: React.ReactNode; interactive?: boolean }) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "group flex h-full min-w-0 flex-col justify-between gap-3 rounded-card bg-surface p-3.5 text-left shadow-card transition-shadow duration-150 ease-out",
        interactive && "cursor-pointer hover:shadow-[var(--ds-shadow-card),var(--ds-shadow-ring-hover)]",
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-2">
        <span className={cn("flex-1 truncate text-caption text-fg-muted", interactive && "decoration-fg/25 underline-offset-4 group-hover:underline")}>{title}</span>
        {interactive && (
          <ArrowUpRight
            aria-hidden
            className="size-3.5 shrink-0 text-fg-subtle transition-[translate,color] duration-150 ease-out group-hover:translate-x-px group-hover:-translate-y-px group-hover:text-fg motion-reduce:transition-none"
            strokeWidth={1.5}
          />
        )}
      </span>
      {children}
      {footer && <span className="truncate text-caption text-fg-subtle">{footer}</span>}
    </div>
  );
}

/** The figure: 22px medium Rethink Sans in tabular numbers, a unit after it in caption subtle on the same baseline. */
function StatFigure({ children, suffix, className }: { children: React.ReactNode; suffix?: React.ReactNode; className?: string }) {
  return (
    <span data-slot="stat-figure" className={cn("flex items-baseline gap-1 leading-none font-medium tracking-tight tabular-nums", className)}>
      <span className="text-[calc(var(--ds-text-h5)+var(--ds-space-1))] text-fg">{children}</span>
      {suffix && <span className="text-caption font-normal tracking-normal text-fg-subtle">{suffix}</span>}
    </span>
  );
}

/** A meter of dots, the charts' language: filled for the share given. */
function StatMeter({ value, max, dots = 20 }: { value: number; max: number; dots?: number }) {
  const filled = value <= 0 ? 0 : Math.max(1, Math.round((value / max) * dots));
  return (
    <span className="flex justify-between" aria-hidden>
      {Array.from({ length: dots }, (_, i) => (
        <span key={i} className={cn("size-1 rounded-pill", i < filled ? "bg-brand" : "bg-blue-10")} />
      ))}
    </span>
  );
}

export { StatCard, StatFigure, StatMeter };
