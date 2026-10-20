"use client";

import * as React from "react";

import { ArrowUpRight } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTabGlide } from "@/hooks/use-tab-glide";
import { cn } from "@/lib/utils";

// The public pricing page: plan cards side by side in one ringed frame, split by hairlines (a 1px gap over a hairline
// fill, so the rules run between rows as well as columns). Each card has the same five parts (header, price, call to
// action, the quota box, the feature box), and on wide screens the cards share their rows through subgrid, so every
// part lines up across the row. Figures in quota and feature lines are picked out in brand blue. Only the most popular
// plan's button is filled (black), so the grid has one main action. `PricingShelves` is the pricing page's two-row
// layout: the largest plan and Enterprise on the right of the second row, with the plan-fit panel filling the left.

/**
 * The site's glass ring: a wrapper 8px wider than its card on every side, in the soft brand blue. A wrapper rather than
 * a spread shadow, so the ring's outer edge shares the card's radius; the negative margin keeps it from adding size.
 */
const GLASS_RING = "-m-2 rounded-card bg-ring-tint p-2";

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
  return <span data-slot="price-note-pill" className={cn("inline-flex h-5 items-center rounded-pill bg-brand/10 px-2 text-caption leading-snug font-medium whitespace-nowrap text-fg-brand", className)} {...props} />;
}

type BillingPeriod = "monthly" | "yearly";

/**
 * Monthly or yearly. One white pill with a brand-blue hairline glides under the chosen option on the tabs' spring (it
 * jumps with reduced motion); until it has been placed the chosen button draws the pill itself, so the first paint
 * looks the same.
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
  const pillRef = React.useRef<HTMLSpanElement>(null);
  const placed = useTabGlide(pillRef, value);

  const surface = "bg-surface shadow-[inset_0_0_0_var(--ds-space-px)_var(--ds-color-brand)]";
  return (
    <div data-slot="pricing-toggle" className={cn("relative isolate inline-flex items-center rounded-pill bg-surface p-1 ring-1 ring-hairline", className)}>
      <span ref={pillRef} aria-hidden="true" className={cn("pointer-events-none absolute top-0 left-0 -z-10 rounded-pill", surface, !placed && "invisible")} />
      {(["monthly", "yearly"] as const).map((period) => {
        const selected = value === period;
        return (
          <button
            key={period}
            data-tab-id={period}
            type="button"
            aria-pressed={selected}
            onClick={() => onValueChange(period)}
            className={cn(
              "inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-body-sm leading-snug font-medium outline-none transition-[color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-focus-ring motion-reduce:transition-none",
              selected ? "text-fg" : "text-fg-muted hover:text-fg",
              selected && !placed && surface,
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

/**
 * A quota or feature line. `hint` puts a tooltip on it; `label` is the full text for assistive tech when the line shows a
 * short form (the brand writes "100 concurrent" for "100 concurrent requests"), which also keeps it on one line.
 */
type PricingFeature = string | { text: string; hint?: React.ReactNode; label?: string };

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
  const { text, hint, label } = typeof feature === "string" ? { text: feature, hint: undefined, label: undefined } : feature;
  return (
    <p aria-label={label} className={cn("text-body-sm text-fg-nav max-sm:text-center", label && "whitespace-nowrap")}>
      {hint ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="cursor-help border-b border-dashed border-line-strong outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
              <PricingHighlight text={text} />
            </span>
          </TooltipTrigger>
          <TooltipContent wrap className="max-w-72">{hint}</TooltipContent>
        </Tooltip>
      ) : (
        <PricingHighlight text={text} />
      )}
    </p>
  );
}

/** A rounded box of lines split by rules, both in the lightest hairline (black at 6%). */
function PricingCardBox({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="pricing-card-box" className={cn("mt-2 rounded-card p-4 ring-1 ring-wash-pill ring-inset [&>*+*]:mt-3 [&>*+*]:border-t [&>*+*]:border-wash-pill [&>*+*]:pt-3", className)} {...props} />;
}

function PricingCard({ name, description, price, period, note, noteHighlight, originalPrice, cta, quota, features, featured = false, badge, className }: PricingCardProps) {
  return (
    <div data-slot="pricing-card" data-featured={featured || undefined} aria-label={featured ? `${name}, most popular` : undefined} role={featured ? "group" : undefined} className={cn("relative flex w-full flex-col bg-surface p-2 leading-snug lg:row-span-5 lg:grid lg:grid-rows-subgrid", className)}>
      <div className="flex items-start gap-3 p-2 max-sm:justify-center max-sm:text-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2 max-sm:justify-center">
            <h3 className="text-h5 leading-snug font-normal tracking-normal text-fg">{name}</h3>
            {badge && <span className="inline-flex h-5 items-center rounded-control border border-line px-2 text-caption font-medium text-fg">{badge}</span>}
          </div>
          {description && <p className="mt-1 text-body-sm text-fg-muted">{description}</p>}
        </div>
      </div>

      {/* The price sits just above the button, with the note above it, so the price and button stay put when billing switches. */}
      <div className="relative flex min-h-30 flex-col justify-end px-2 pt-6 pb-3 text-center">
        {(note || noteHighlight) && (
          <div className="mb-2.5 flex h-5 items-center justify-center">
            <span className="inline-flex items-center gap-1.5 text-caption whitespace-nowrap text-fg-nav">
              {note}
              {noteHighlight && <span className={cn("font-medium text-fg-brand", note && "before:mr-1.5 before:text-fg-nav before:content-['·']")}>{noteHighlight}</span>}
            </span>
          </div>
        )}
        <div className="flex flex-wrap items-baseline justify-center gap-x-1">
          <span className="font-data text-h2 leading-none font-heavy text-fg">{price}</span>
          {originalPrice && <span className="text-body-sm font-medium text-fg-faint line-through">{originalPrice}</span>}
          {period && <span className="text-caption text-fg-muted">{period}</span>}
        </div>
      </div>

      <div className="p-2 [&>*]:w-full">{cta}</div>

      {quota && quota.length > 0 ? (
        <PricingCardBox>
          {quota.map((line) => (
            <FeatureLine key={typeof line === "string" ? line : line.text} feature={line} />
          ))}
        </PricingCardBox>
      ) : (
        <div aria-hidden="true" />
      )}

      {features && features.length > 0 && (
        <PricingCardBox>
          {features.map((line) => (
            <FeatureLine key={typeof line === "string" ? line : line.text} feature={line} />
          ))}
        </PricingCardBox>
      )}
    </div>
  );
}

const COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1 lg:grid-cols-1",
  2: "sm:grid-cols-2 lg:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-5",
  6: "sm:grid-cols-2 lg:grid-cols-6",
};

/** The ringed frame the cards sit in. Cards wrap to a new row after `columns`, each row still aligned by subgrid. */
function PricingGrid({ columns = 4, className, children, ...props }: React.ComponentProps<"div"> & { columns?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return (
    <div data-slot="pricing-grid" className={cn(GLASS_RING, className)} {...props}>
      <div className="overflow-hidden rounded-card bg-hairline ring-1 ring-hairline">
        <div className={cn("grid grid-cols-1 gap-px", COLUMNS[columns])}>{children}</div>
      </div>
    </div>
  );
}

const COL_START: Record<number, string> = { 1: "lg:col-start-1", 2: "lg:col-start-2", 3: "lg:col-start-3", 4: "lg:col-start-4", 5: "lg:col-start-5", 6: "lg:col-start-6" };
const COL_SPAN: Record<number, string> = { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4", 5: "lg:col-span-5" };

function placed(node: React.ReactNode, className: string) {
  return React.isValidElement<{ className?: string }>(node) ? React.cloneElement(node, { className: cn(node.props.className, className) }) : node;
}

/**
 * The pricing page's two-row grid in one ringed frame. Row one holds `first` (Free and every self-serve plan but the
 * largest); a short white band follows; row two puts `second` (the largest plan and Enterprise) on the right and `panel`
 * (usually PricingPlanFit) across the columns they leave free. Cards in each row line up through the shared subgrid rows,
 * and the panel comes last in the DOM, so it stacks last on phones. Pass PricingCards (or elements that take
 * `className`) in `second`, since each is placed by class.
 */
function PricingShelves({ first, second, panel, className }: { first: React.ReactNode[]; second: React.ReactNode[]; panel?: React.ReactNode; className?: string }) {
  const columns = Math.max(1, Math.min(first.length, 6));
  const panelSpan = Math.max(1, columns - second.length);
  return (
    <div data-slot="pricing-shelves" className={cn(GLASS_RING, className)}>
      <div className="overflow-hidden rounded-card bg-hairline ring-1 ring-hairline">
        <div className={cn("grid grid-cols-1 gap-px lg:grid-rows-[repeat(11,auto)]", COLUMNS[columns])}>
          {first}
          <div aria-hidden="true" className="col-span-full h-6 bg-surface lg:row-start-6 lg:h-8" />
          {React.Children.map(second, (card, i) => placed(card, cn("lg:row-start-7", COL_START[panelSpan + 1 + i])))}
          {panel && placed(panel, cn("sm:col-span-2 lg:col-start-1 lg:row-span-5 lg:row-start-7", COL_SPAN[panelSpan]))}
        </div>
      </div>
    </div>
  );
}

type PlanFitRow = { name: React.ReactNode; range: React.ReactNode; price: React.ReactNode };

/**
 * "Which plan fits your page volume?": each plan's best-value range in a ringed white card, the price in brand blue, for
 * the free columns of PricingShelves' second row. `patternSrc` is the faint dot pattern in its top right corner (the
 * brand's logo-edge.svg), fading out downward.
 */
function PricingPlanFit({
  title = (
    <>
      Which plan fits <span className="text-fg-brand">your page volume</span>?
    </>
  ),
  rows,
  footnote,
  patternSrc,
  className,
}: {
  title?: React.ReactNode;
  rows: PlanFitRow[];
  footnote?: React.ReactNode;
  patternSrc?: string;
  className?: string;
}) {
  return (
    <div data-slot="pricing-plan-fit" className={cn("relative flex w-full flex-col bg-surface p-6 leading-snug lg:p-8", className)}>
      <div className={cn(GLASS_RING, "relative flex flex-1 flex-col")}>
        <div className="relative isolate flex flex-1 flex-col justify-center gap-6 overflow-hidden rounded-card bg-surface px-6 py-8 ring-1 ring-wash-pill ring-inset lg:px-10 lg:py-9">
          {patternSrc && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 right-0 -z-10 h-2/5 w-full bg-size-[auto_100%] bg-right-top bg-no-repeat opacity-35 [mask-image:linear-gradient(to_bottom,var(--ds-color-black)_30%,transparent)]"
              style={{ backgroundImage: `url(${patternSrc})` }}
            />
          )}
          <h3 className="max-w-104 text-h3 leading-heading font-normal tracking-normal text-balance text-fg">{title}</h3>
          <ul className="flex flex-col [&>li+li]:mt-3 [&>li+li]:border-t [&>li+li]:border-wash-pill [&>li+li]:pt-3">
            {rows.map((row, i) => (
              <li key={i} className="flex items-baseline gap-4">
                <span className="w-22 shrink-0 text-body-sm text-fg sm:w-30">{row.name}</span>
                <span className="flex-1 text-body-sm text-fg-muted">{row.range}</span>
                <span className="w-14 shrink-0 text-right text-body-sm text-fg-brand sm:w-18">{row.price}</span>
              </li>
            ))}
          </ul>
          {footnote && <p className="text-caption text-fg-muted">{footnote}</p>}
        </div>
      </div>
    </div>
  );
}

/** A ringed white strip under the plans: a line on the left, an action (an outline pill) on the right. */
function PricingBanner({ action, className, children }: { action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div data-slot="pricing-banner" className={cn(GLASS_RING, className)}>
      <div className="flex flex-col gap-4 rounded-card bg-surface px-6 py-5 ring-1 ring-hairline sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-body leading-snug text-fg-nav">{children}</p>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

type CreditCostRow = { id?: string; title: React.ReactNode; href?: string; cost: React.ReactNode };

/**
 * What each API costs in credits: one line per API in a ringed white table, the name linking to its docs (with a small
 * arrow) and the cost in brand blue. Open it with a SectionHeading and SectionHeaderRule, as the pricing page does.
 */
function CreditCostsTable({
  rows,
  caption = "API credit costs per request",
  labels = { name: "API", cost: "Credits" },
  className,
}: {
  rows: CreditCostRow[];
  caption?: string;
  labels?: { name: React.ReactNode; cost: React.ReactNode };
  className?: string;
}) {
  return (
    <div data-slot="credit-costs-table" className={cn(GLASS_RING, className)}>
      <table className="w-full overflow-hidden rounded-card bg-surface text-left text-body leading-snug ring-1 ring-hairline">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-wash-pill">
            <th scope="col" className="px-6 py-4 font-normal text-fg-muted md:px-8">
              {labels.name}
            </th>
            <th scope="col" className="px-6 py-4 text-right font-normal text-fg-muted md:px-8">
              {labels.cost}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-wash-pill">
          {rows.map((row, i) => (
            <tr key={row.id ?? i}>
              <th scope="row" className="px-6 py-3.5 font-normal md:px-8">
                {row.href ? (
                  <a href={row.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-sm text-fg outline-none hover:text-fg-brand focus-visible:ring-2 focus-visible:ring-focus-ring">
                    {row.title}
                    <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 text-fg-faint" />
                  </a>
                ) : (
                  <span className="text-fg">{row.title}</span>
                )}
              </th>
              <td className="px-6 py-3.5 text-right text-fg-brand tabular-nums md:px-8">{row.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

export {
  PricingCard,
  PricingCardBox,
  PricingGrid,
  PricingShelves,
  PricingPlanFit,
  PricingBanner,
  CreditCostsTable,
  PricingToggle,
  PricingHighlight,
  PriceNotePill,
  PricingHairlines,
  type PricingCardProps,
  type PricingFeature,
  type PlanFitRow,
  type CreditCostRow,
  type BillingPeriod,
};
