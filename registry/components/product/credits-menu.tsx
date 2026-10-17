"use client";

import * as React from "react";
import { CalendarClock, Gauge, Info } from "lucide-react";

import { StatFigure, StatMeter } from "@/components/product/stat-card";
import { Button } from "@/components/ui/button";
import { DotGlyph } from "@/components/ui/dot-glyph";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// A gem in the dot language: a solid diamond on a 5 by 5 grid, few enough dots to read clearly at icon size.
export const GEM_GLYPH = ["..2..", ".222.", "22222", ".222.", "..2.."];

export type CreditsPlan = {
  /** "Pro" (a trailing " Plan" is dropped). */
  name: string;
  /** "$49/month": the amount, then the period in a lighter gray. */
  price?: string;
  /** "Nov 1": shown as "Resets on Nov 1". */
  resetLabel?: string;
};

const splitPrice = (label: string): [string, string] => {
  const slash = label.indexOf("/");
  return slash === -1 ? [label, ""] : [label.slice(0, slash).trim(), label.slice(slash)];
};

const compact = (n: number) => n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });

// The top bar's credits: a gem and the credits left, in the workspace name's type so the two top corners match. It
// opens the plan and credits panel from its corner: the plan, what's left over a row of dots (the overview's meter),
// when credits refresh, the rate limit, the auto top-up switch, and the upgrade and usage actions.
function CreditsMenu({
  remaining,
  total,
  plan,
  refill,
  rateLimit,
  autoTopUp,
  onAutoTopUpChange,
  autoTopUpDescription = "Top up 1K credits automatically when you run low",
  autoTopUpDisabled = false,
  onUpgrade,
  upgradeDisabled = false,
  usageAction,
  notice,
  loading = false,
  className,
}: {
  remaining: number;
  /** The plan's credits; without it, no meter. */
  total?: number;
  plan: CreditsPlan;
  /** The credits added at the next reset. */
  refill?: number;
  /** "600 req/min". */
  rateLimit?: string;
  autoTopUp?: boolean;
  onAutoTopUpChange?: (on: boolean) => void;
  autoTopUpDescription?: string;
  autoTopUpDisabled?: boolean;
  /** Without it (an enterprise plan), the panel says to contact the team instead. */
  onUpgrade?: () => void;
  upgradeDisabled?: boolean;
  /** "View usage": your router's link, rendered as an outline button. */
  usageAction?: React.ReactNode;
  /** A quiet line under the actions ("Your organization's admins manage the plan."). */
  notice?: React.ReactNode;
  loading?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  if (loading) return <Skeleton aria-hidden className={cn("ml-auto h-8 w-28", className)} />;
  const formatted = remaining.toLocaleString("en-US");
  const [amount, period] = splitPrice(plan.price ?? "");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${formatted} credits remaining`}
          className={cn(
            "ml-auto flex h-8 items-center gap-(--ds-space-frame) rounded-control px-2.5 text-body-sm font-medium outline-none transition-colors duration-150 hover:bg-wash-hover focus-visible:ring-2 focus-visible:ring-focus-ring data-[state=open]:bg-wash-hover",
            className,
          )}
        >
          <DotGlyph rows={GEM_GLYPH} className="size-4 shrink-0 text-brand" />
          <span className="text-fg-muted">
            <span className="text-fg/80 tabular-nums">{formatted}</span> credits
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-label="Plan and credits" className="w-80 max-w-[calc(100vw-1.5rem)] p-(--ds-space-frame)">
        <div className="flex flex-col gap-(--ds-space-frame) rounded-control bg-surface p-0.5">
          <div className="flex items-center gap-3 rounded-control bg-neutral-5 px-3 py-2.5">
            <DotGlyph rows={GEM_GLYPH} className="size-8 shrink-0 text-brand" />
            <div className="min-w-0">
              <p className="truncate text-body-sm font-medium">{plan.name.replace(/ Plan$/, "")}</p>
              {amount && (
                <p className="text-body-sm">
                  {amount} {period && <span className="text-fg-muted">{period}</span>}
                </p>
              )}
              {plan.resetLabel && <p className="mt-0.5 text-caption text-fg-subtle">Resets on {plan.resetLabel}</p>}
            </div>
          </div>
          <div className="rounded-control border border-line px-3 py-2.5">
            <p className="text-caption text-fg-muted">Credits remaining</p>
            <StatFigure suffix={total !== undefined ? `/${compact(total)}` : undefined} className="mt-2">
              {formatted}
            </StatFigure>
            {total !== undefined && <StatMeter value={remaining} max={total} className="mt-2.5" />}
          </div>
          {plan.resetLabel && refill !== undefined && refill > 0 && (
            <div className="flex items-center gap-2 rounded-control bg-neutral-5 px-3 py-2 text-body-sm text-fg-muted">
              <CalendarClock className="size-4 shrink-0" strokeWidth={1.5} />
              <span className="flex-1">
                Refresh <span className="font-medium text-fg">{plan.resetLabel}</span> with <span className="font-medium text-fg">{compact(refill)}</span> credits
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} aria-label="Unused credits don't roll over to the next month." className="outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                    <Info className="size-3.5 text-fg-subtle" strokeWidth={1.5} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Unused credits don&apos;t roll over to the next month.</TooltipContent>
              </Tooltip>
            </div>
          )}
          {rateLimit && (
            <div className="flex items-center gap-2 rounded-control bg-neutral-5 px-3 py-2 text-body-sm text-fg-muted">
              <Gauge className="size-4 shrink-0" strokeWidth={1.5} />
              <span className="flex-1">Rate limit</span>
              <span className="font-medium whitespace-nowrap text-fg tabular-nums">{rateLimit}</span>
            </div>
          )}
          {onAutoTopUpChange && (
            <div className="flex items-center gap-4 rounded-control border border-line px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-body-sm font-medium">Auto top-up</p>
                <p className="mt-0.5 text-caption text-pretty text-fg-subtle">{autoTopUpDescription}</p>
              </div>
              <Switch checked={autoTopUp} onCheckedChange={onAutoTopUpChange} disabled={autoTopUpDisabled} aria-label="Auto top-up" />
            </div>
          )}
          {onUpgrade ? (
            <Button
              variant="brand"
              size="sm"
              disabled={upgradeDisabled}
              onClick={() => {
                setOpen(false);
                onUpgrade();
              }}
              className="w-full"
            >
              Upgrade plan
            </Button>
          ) : (
            <p className="py-1 text-center text-caption text-fg-subtle">Contact the team to change your enterprise plan.</p>
          )}
          {notice && <p className="text-center text-caption text-fg-subtle">{notice}</p>}
          {usageAction && (
            <Button variant="outline" size="sm" asChild className="w-full" onClick={() => setOpen(false)}>
              {usageAction}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { CreditsMenu };
