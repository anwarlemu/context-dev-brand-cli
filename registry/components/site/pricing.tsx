"use client";

import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// The public pricing page: plan cards side by side in one ringed frame, split by hairlines (a 1px gap over a hairline
// fill, so the rules run between rows as well as columns). Each card has the same five parts (header, price, call to
// action, the quota box, the feature box), and on wide screens the cards share their rows through subgrid, so every
// part lines up across the row. Figures in quota and feature lines are picked out in brand blue. Only the most popular
// plan's button is filled, so the grid has one main action.

/** Figures in a line (numbers, prices, percentages) that the brand picks out in blue. */
const FIGURE = /(\$?\d[\d,.]*(?:K|M|%)?)/;

/** A line of text with its figures in brand blue. Pass `pattern` (one capture group) to pick out something else. */
function PricingHighlight({ text, pattern = FIGURE, className }: { text: string; pattern?: RegExp; className?: string }) {
  return (
    <>
      {text.split(new RegExp(pattern, "g")).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={cn("text-fg-brand", className)}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** The small tinted pill for a pricing badge, such as what yearly billing saves. */
function PriceNotePill({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="price-note-pill" className={cn("inline-flex h-5 items-center rounded-pill bg-brand/10 px-2 text-caption font-medium whitespace-nowrap text-fg-brand", className)} {...props} />;
}

type BillingPeriod = "monthly" | "yearly";

/**
 * Monthly or yearly. One white pill with a brand-blue hairline glides under the chosen option (transform and width,
 * ease-out); until it has been measured the chosen button draws the pill itself, so the first paint looks the same.
 */
function PricingToggle({
  value,
  onValueChange,
  yearlyNote = "2 months free",
  labels = { monthly: "Monthly", yearly: "Yearly" },
  className,
}: {
  value: BillingPeriod;
  onValueChange: (value: BillingPeriod) => void;
  yearlyNote?: React.ReactNode;
  labels?: Record<BillingPeriod, React.ReactNode>;
  className?: string;
}) {
  const refs = React.useRef<Record<BillingPeriod, HTMLButtonElement | null>>({ monthly: null, yearly: null });
  const [pill, setPill] = React.useState<{ x: number; width: number } | null>(null);

  React.useLayoutEffect(() => {
    const place = () => {
      const button = refs.current[value];
      if (button) setPill({ x: button.offsetLeft, width: button.offsetWidth });
    };
    place();
    const observer = new ResizeObserver(place);
    Object.values(refs.current).forEach((button) => button && observer.observe(button));
    return () => observer.disconnect();
  }, [value]);

  const surface = "bg-surface shadow-[inset_0_0_0_var(--ds-space-px)_var(--ds-color-brand)]";
  return (
    <div data-slot="pricing-toggle" className={cn("relative isolate inline-flex items-center rounded-pill bg-surface p-1 ring-1 ring-hairline", className)}>
      {pill && (
        <span
          aria-hidden="true"
          className={cn("pointer-events-none absolute top-1 bottom-1 left-0 -z-10 rounded-pill transition-[translate,width] duration-200 ease-out motion-reduce:transition-none", surface)}
          style={{ translate: `${pill.x}px 0`, width: pill.width }}
        />
      )}
      {(["monthly", "yearly"] as const).map((period) => {
        const selected = value === period;
        return (
          <button
            key={period}
            ref={(node) => {
              refs.current[period] = node;
            }}
            type="button"
            aria-pressed={selected}
            onClick={() => onValueChange(period)}
            className={cn(
              "inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-body-sm font-medium outline-none transition-[color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-focus-ring motion-reduce:transition-none",
              selected ? "text-fg" : "text-fg-muted hover:text-fg",
              selected && !pill && surface,
            )}
          >
            {labels[period]}
            {period === "yearly" && yearlyNote && <PriceNotePill>{yearlyNote}</PriceNotePill>}
          </button>
        );
      })}
    </div>
  );
}

type PricingFeature = string | { text: string; hint?: React.ReactNode };

type PricingCardProps = {
  name: string;
  description?: string;
  /** The amount as shown, e.g. "$99", or "Custom". */
  price: React.ReactNode;
  /** After the amount, e.g. "/month"; leave out for a custom price. */
  period?: React.ReactNode;
  /** The line above the price, e.g. "$990/yr". */
  note?: React.ReactNode;
  /** The blue part of that line, e.g. "Save $198". */
  noteHighlight?: React.ReactNode;
  /** The struck-through old price beside the amount, for a discount. */
  originalPrice?: React.ReactNode;
  /** The call to action, usually a full-width pill Button (filled `pill` on the featured plan, `pill-outline` elsewhere). */
  cta?: React.ReactNode;
  /** The quota box: credits, overage and rate limit lines. */
  quota?: PricingFeature[];
  features?: PricingFeature[];
  /** The most popular plan. Marks the card for assistive tech; give it the filled button. */
  featured?: boolean;
  /** A small hairline label beside the name, e.g. "Recommended". */
  badge?: React.ReactNode;
  className?: string;
};

function FeatureLine({ feature }: { feature: PricingFeature }) {
  const { text, hint } = typeof feature === "string" ? { text: feature, hint: undefined } : feature;
  return (
    <p className="text-body-sm text-fg-nav max-sm:text-center">
      {hint ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="cursor-help border-b border-dashed border-line-strong outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
              <PricingHighlight text={text} />
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-pretty">{hint}</TooltipContent>
        </Tooltip>
      ) : (
        <PricingHighlight text={text} />
      )}
    </p>
  );
}

/** A rounded hairline box of lines split by hairline rules. */
function PricingCardBox({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="pricing-card-box" className={cn("mt-2 rounded-card p-4 ring-1 ring-hairline ring-inset [&>*+*]:mt-3 [&>*+*]:border-t [&>*+*]:border-hairline [&>*+*]:pt-3", className)} {...props} />;
}

function PricingCard({ name, description, price, period, note, noteHighlight, originalPrice, cta, quota, features, featured = false, badge, className }: PricingCardProps) {
  return (
    <div data-slot="pricing-card" data-featured={featured || undefined} aria-label={featured ? `${name}, most popular` : undefined} role={featured ? "group" : undefined} className={cn("relative flex w-full flex-col bg-surface p-2 lg:row-span-5 lg:grid lg:grid-rows-subgrid", className)}>
      <div className="min-w-0 p-2 max-sm:text-center">
        <div className="flex items-center gap-2 max-sm:justify-center">
          <h3 className="text-h5 font-normal text-fg">{name}</h3>
          {badge && <span className="inline-flex h-5 items-center rounded-control border border-line px-2 text-caption font-medium text-fg">{badge}</span>}
        </div>
        {description && <p className="mt-1 text-body-sm text-fg-muted">{description}</p>}
      </div>

      {/* The price sits just above the button, with the note above it, so the price and button stay put when billing switches. */}
      <div className="flex min-h-30 flex-col justify-end px-2 pt-6 pb-3 text-center">
        {(note || noteHighlight) && (
          <div className="mb-2.5 flex h-5 items-center justify-center">
            <span className="inline-flex items-center gap-1.5 text-caption whitespace-nowrap text-fg-muted">
              {note}
              {noteHighlight && <span className={cn("font-medium text-fg-brand", note && "before:mr-1.5 before:text-fg-muted before:content-['·']")}>{noteHighlight}</span>}
            </span>
          </div>
        )}
        <div className="flex flex-wrap items-baseline justify-center gap-x-1">
          <span className="font-data text-h2 leading-none font-medium text-fg">{price}</span>
          {originalPrice && <span className="text-body-sm font-medium text-fg-faint line-through">{originalPrice}</span>}
          {period && <span className="text-caption text-fg-muted">{period}</span>}
        </div>
      </div>

      <div className="p-2 [&>*]:w-full">{cta}</div>

      {quota && quota.length > 0 ? (
        <PricingCardBox>
          {quota.map((line, i) => (
            <FeatureLine key={i} feature={line} />
          ))}
        </PricingCardBox>
      ) : (
        <div aria-hidden="true" />
      )}

      {features && features.length > 0 && (
        <PricingCardBox>
          {features.map((line, i) => (
            <FeatureLine key={i} feature={line} />
          ))}
        </PricingCardBox>
      )}
    </div>
  );
}

const COLUMNS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "sm:grid-cols-2 lg:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-5",
  6: "sm:grid-cols-2 lg:grid-cols-6",
};

/** The ringed frame the cards sit in. Cards wrap to a new row after `columns`, each row still aligned by subgrid. */
function PricingGrid({ columns = 4, className, children, ...props }: React.ComponentProps<"div"> & { columns?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return (
    <div data-slot="pricing-grid" className={cn("rounded-card bg-surface shadow-[0_0_0_var(--ds-space-px)_var(--ds-color-border-hairline),0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)]", className)} {...props}>
      <div className={cn("grid grid-cols-1 gap-px overflow-hidden rounded-card bg-hairline", COLUMNS[columns])}>{children}</div>
    </div>
  );
}

/** The dashed band the pricing page leads into its next section with: dashed vertical hairlines every 12px. Set a height. */
function PricingHairlines({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div aria-hidden="true" data-slot="pricing-hairlines" className={cn("relative w-full overflow-hidden bg-canvas", className)} {...props}>
      {/* Vertical lines from a repeating gradient, cut into 4-on, 4-off dashes by a repeating mask. */}
      <span className="absolute inset-0 bg-[repeating-linear-gradient(to_right,var(--ds-color-border-strong)_0_var(--ds-space-px),transparent_var(--ds-space-px)_var(--ds-space-3))] [mask-image:repeating-linear-gradient(to_bottom,var(--ds-color-black)_0_var(--ds-space-1),transparent_var(--ds-space-1)_var(--ds-space-2))]" />
    </div>
  );
}

export { PricingCard, PricingCardBox, PricingGrid, PricingToggle, PricingHighlight, PriceNotePill, PricingHairlines, type PricingCardProps, type PricingFeature, type BillingPeriod };
