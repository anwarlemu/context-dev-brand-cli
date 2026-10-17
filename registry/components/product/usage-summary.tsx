"use client";

import * as React from "react";

import { StatFigure, StatMeter } from "@/components/product/stat-card";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// The usage page at a glance, over the overview rather than away from it (opened from the Credits remaining card):
// what's left over a long dot meter with today's and this month's use beside it, three centered stat cards (calls,
// credits, success rate), the day-by-day chart in a glyph card, and the APIs that spent the most this month.

const compact = (n: number) => n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** Credits remaining: the count over its quota, then a row of dots (40 here, 20 on the cards), brand blue for what's left. */
function CreditsRemaining({ remaining, total, dots = 40, className }: { remaining: number; total?: number; dots?: number; className?: string }) {
  return (
    <div data-slot="credits-remaining" className={cn("max-w-md min-w-56 flex-1", className)}>
      <p className="text-caption text-fg-muted">Credits remaining</p>
      <StatFigure suffix={total !== undefined ? `/${compact(total)}` : undefined} className="mt-2">
        {remaining.toLocaleString("en-US")}
      </StatFigure>
      {total !== undefined && <StatMeter value={remaining} max={total} dots={dots} className="mt-3" />}
    </div>
  );
}

/** "1,204 used today · 41,880 this month", the numbers in full text color. */
function CreditsUsed({ today, month }: { today: number; month: number }) {
  return (
    <p className="text-caption text-fg-muted">
      <span className="text-fg tabular-nums">{today.toLocaleString("en-US")}</span> used today · <span className="text-fg tabular-nums">{month.toLocaleString("en-US")}</span> this month
    </p>
  );
}

/** A ranked list: each name, a thin bar against the top one, and its count. */
function UsageBarList({ title, items, className }: { title?: React.ReactNode; items: { key: string; label: React.ReactNode; value: number }[]; className?: string }) {
  const top = items[0]?.value ?? 0;
  return (
    <div data-slot="usage-bar-list" className={className}>
      {title && <p className="mb-2 text-caption text-fg-muted">{title}</p>}
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.key} className="grid grid-cols-[minmax(0,9rem)_1fr_3rem] items-center gap-3 text-body-sm">
            <span className="truncate">{item.label}</span>
            <span className="h-1 rounded-pill bg-blue-10">
              <span className="block h-full rounded-pill bg-brand" style={{ width: `${top > 0 ? (item.value / top) * 100 : 0}%` }} />
            </span>
            <span className="text-right text-fg-muted tabular-nums">{item.value.toLocaleString("en-US")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The window: "Usage" over the plan line, the pieces scrolling inside on a short screen, the link out in the footer. */
function UsageSummaryDialog({
  open,
  onOpenChange,
  title = "Usage",
  description,
  footer,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** "See full usage": your router's link. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogBody className="@container flex flex-col gap-3">{children}</DialogBody>
        {footer && <DialogFooter className="justify-start">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export { CreditsRemaining, CreditsUsed, UsageBarList, UsageSummaryDialog };
