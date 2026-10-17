import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ArrowUpRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// The overview's stat card: a caption title at the top, the figure (22px medium, tabular) in the middle, a quiet line
// at the foot that keeps its height while loading. Given onClick, the whole card is the button; given asChild (wrap
// your router's link), the whole card is the link. Either way the title underlines, the arrow darkens, and
// the card gains the translucent brand ring on hover. Lay several out in a list (StatCardGrid), two by two.
function StatCard({
  title,
  footer,
  onClick,
  asChild = false,
  className,
  children,
}: {
  title: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  /** Render your link as the card (pass it as the only child, with the card's content inside). */
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const isAction = asChild || Boolean(onClick);
  const classes = cn(
    "group flex h-full min-w-0 flex-1 flex-col justify-between gap-3 rounded-card bg-surface p-3.5 text-left no-underline shadow-card outline-none transition-shadow duration-150 ease-out focus-visible:ring-2 focus-visible:ring-focus-ring",
    isAction && "cursor-pointer hover:shadow-[var(--ds-shadow-card),var(--ds-shadow-ring-hover)]",
    className,
  );
  const body = (content: React.ReactNode) => (
    <>
      <span className="flex items-center gap-2">
        <span className={cn("flex-1 truncate text-caption text-fg-muted", isAction && "decoration-fg/25 underline-offset-4 group-hover:underline")}>{title}</span>
        {isAction && (
          <ArrowUpRight
            aria-hidden
            className="size-3.5 shrink-0 text-fg-subtle transition-colors duration-150 ease-out group-hover:text-fg motion-reduce:transition-none"
            strokeWidth={1.5}
          />
        )}
      </span>
      {content}
      <span className="min-h-4 truncate text-caption text-fg-subtle">{footer}</span>
    </>
  );
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return (
      <Slot data-slot="stat-card" className={classes}>
        {React.cloneElement(children, undefined, body(children.props.children))}
      </Slot>
    );
  }
  if (onClick) {
    return (
      <button type="button" data-slot="stat-card" onClick={onClick} className={classes}>
        {body(children)}
      </button>
    );
  }
  return (
    <div data-slot="stat-card" className={classes}>
      {body(children)}
    </div>
  );
}

/** The cards as a list, one column when narrow and two by two once the page (an @container) has room. */
function StatCardGrid({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <ul aria-label={label} data-slot="stat-card-grid" className={cn("grid h-full gap-3 @md:grid-cols-2", className)}>
      {React.Children.map(children, (child) => (child ? <li className="flex min-w-0">{child}</li> : null))}
    </ul>
  );
}

/** The figure: 22px medium in tabular numbers, a unit after it in caption subtle on the same baseline. The row sits at
   caption size so its tight tracking resolves to the same small step wherever the figure is placed. */
function StatFigure({ children, suffix, className }: { children: React.ReactNode; suffix?: React.ReactNode; className?: string }) {
  return (
    <span data-slot="stat-figure" className={cn("flex items-baseline gap-1 text-caption leading-none font-medium tracking-tight tabular-nums", className)}>
      <span className="text-[calc(var(--ds-text-h5)+var(--ds-space-1))] text-fg">{children}</span>
      {suffix && <span className="text-caption font-normal tracking-normal text-fg-subtle">{suffix}</span>}
    </span>
  );
}

/** While the figure loads: a block at its height, so the card never jumps. */
function StatFigureSkeleton() {
  return <Skeleton className="h-[calc(var(--ds-text-h5)+var(--ds-space-1))] w-24" />;
}

/** A meter of dots, the charts' language: brand blue for the share left, pale blue for the rest. */
function StatMeter({ value, max, dots = 20, className }: { value: number; max: number; dots?: number; className?: string }) {
  const filled = value <= 0 || max <= 0 ? 0 : Math.min(dots, Math.max(1, Math.round((value / max) * dots)));
  return (
    <span className={cn("flex justify-between", className)} aria-hidden>
      {Array.from({ length: dots }, (_, i) => (
        <span key={i} className={cn("size-1 rounded-pill", i < filled ? "bg-brand" : "bg-blue-10")} />
      ))}
    </span>
  );
}

export { StatCard, StatCardGrid, StatFigure, StatFigureSkeleton, StatMeter };
