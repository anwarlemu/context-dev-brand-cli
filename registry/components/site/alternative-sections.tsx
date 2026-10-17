import * as React from "react";
import { Check } from "lucide-react";

import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { cn } from "@/lib/utils";

// The alternatives pages ("The top Firecrawl alternative"): the site's Hero with a quick comparison card in its blue
// frame, the logo strip, then why switch, the full comparison, the cost per 1,000 pages, which one fits, the FAQ and
// the closing call to action. Every table is a white card in the soft blue ring, our column tinted blue; a yes is a
// check (blue for us, gray for them), a no is a faint dash, and a string is shown as is.

export type ComparisonSupport = boolean | string;

/** One comparison cell: a check, a dash, or a short note. `ours` paints it blue. */
function ComparisonSupportCell({ value, ours = false }: { value: ComparisonSupport; ours?: boolean }) {
  if (typeof value === "string") return <span className={cn("text-body-sm", ours ? "font-medium text-fg-brand" : "text-fg-muted")}>{value}</span>;
  if (value) {
    return (
      <span className="inline-flex justify-center">
        <Check aria-hidden="true" className={cn("size-5", ours ? "text-fg-brand" : "text-fg-faint")} />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  return (
    <span className="text-body-sm text-neutral-30">
      <span aria-hidden="true">–</span>
      <span className="sr-only">No</span>
    </span>
  );
}

// The ringed white table card: the ring is the wrapper's tint, so it shares the card's radius and adds no size.
function TableCard({ label, minWidth, children }: { label: string; minWidth: string; children: React.ReactNode }) {
  return (
    <div className="-m-2 rounded-card bg-ring-tint p-2">
      <div tabIndex={0} role="region" aria-label={label} className="overflow-x-auto rounded-card bg-surface ring-1 ring-hairline outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2">
        <table className={cn("w-full border-collapse text-left", minWidth)}>{children}</table>
      </div>
    </div>
  );
}

const OURS_TINT = "bg-brand/5";

export type QuickCompareRow = { feature: string; ours: ComparisonSupport; theirs: ComparisonSupport };

/**
 * The hero's quick comparison: a white card for the hero's blue frame (HeroMedia), three columns, the rows past the
 * third hidden on phones (every row is in the full comparison further down).
 */
function AlternativeQuickCompare({ ours, competitor, rows, rowsOnPhones = 3, className }: { ours: string; competitor: string; rows: QuickCompareRow[]; rowsOnPhones?: number; className?: string }) {
  return (
    <div data-slot="alternative-quick-compare" className={cn("w-full overflow-hidden rounded-card bg-surface text-left", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-caption sm:text-body-sm">
            <th scope="col" className="px-4 py-3 font-normal text-fg-muted sm:px-6">
              Feature
            </th>
            <th scope="col" className="w-22 px-1 py-3 text-center font-medium text-fg-brand sm:w-36 sm:px-3">
              {ours}
            </th>
            <th scope="col" className="w-22 px-1 py-3 text-center font-normal text-fg sm:w-36 sm:px-3">
              {competitor}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.feature} className={cn("border-t border-wash-pill", index >= rowsOnPhones && "max-sm:hidden")}>
              <th scope="row" className="px-4 py-3 text-body-sm font-normal text-fg-nav sm:px-6 sm:py-3.5 sm:text-body">
                {row.feature}
              </th>
              <td className="px-1 py-3 text-center sm:px-3">
                <ComparisonSupportCell value={row.ours} ours />
              </td>
              <td className="px-1 py-3 text-center sm:px-3">
                <ComparisonSupportCell value={row.theirs} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type AlternativeReason = { title: React.ReactNode; body: React.ReactNode; tag: React.ReactNode };

function ReasonCard({ reason, featured = false }: { reason: AlternativeReason; featured?: boolean }) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-4 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8">
      <span className="w-fit rounded-pill bg-ring-tint px-3 py-1 text-body-sm text-fg-brand">{reason.tag}</span>
      <h3 className={cn("font-normal text-fg", featured ? "max-w-3xl text-h3" : "text-h4")}>{reason.title}</h3>
      <p className={cn("text-fg-secondary", featured ? "max-w-3xl text-body-lg" : "text-body")}>{reason.body}</p>
    </div>
  );
}

/**
 * Why switch: the first reason as a wide featured card, the rest two across (an odd last one spans both), each with a
 * tag pill, a title and a paragraph.
 */
function AlternativeReasons({
  title = "Why",
  accent = "switch",
  description,
  reasons,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & { title?: React.ReactNode; accent?: React.ReactNode; description?: React.ReactNode; reasons: AlternativeReason[] }) {
  const [featured, ...rest] = reasons;
  return (
    <SiteSection lines className={className} {...props}>
      <SectionHeading title={title} accent={accent} description={description} />
      <SectionHeaderRule />
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {featured && (
          <li className="-m-2 rounded-card bg-ring-tint p-2 md:col-span-2">
            <ReasonCard reason={featured} featured />
          </li>
        )}
        {rest.map((reason, index) => (
          <li key={index} className={cn("-m-2 rounded-card bg-ring-tint p-2", rest.length % 2 === 1 && index === rest.length - 1 && "md:col-span-2")}>
            <ReasonCard reason={reason} />
          </li>
        ))}
      </ul>
    </SiteSection>
  );
}

export type AlternativeComparisonRow = { category: string; feature: React.ReactNode; ours: ComparisonSupport; theirs: ComparisonSupport };

/** The full comparison: a ringed table grouped by category, our column tinted. */
function AlternativeComparisonTable({
  ours,
  competitor,
  rows,
  title = "Full",
  accent = "comparison",
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & { ours: string; competitor: string; rows: AlternativeComparisonRow[]; title?: React.ReactNode; accent?: React.ReactNode }) {
  const categories = [...new Set(rows.map((row) => row.category))];
  return (
    <SiteSection lines className={className} {...props}>
      <SectionHeading title={title} accent={accent} />
      <SectionHeaderRule />
      <TableCard label={`${ours} compared with ${competitor}`} minWidth="min-w-136">
        <thead>
          <tr className="text-body-sm">
            <th scope="col" className="px-5 py-4 font-normal text-fg-muted md:px-8">
              Feature
            </th>
            <th scope="col" className={cn("w-36 px-4 py-4 text-center font-medium text-fg-brand md:w-44", OURS_TINT)}>
              {ours}
            </th>
            <th scope="col" className="w-36 px-4 py-4 text-center font-normal text-fg md:w-44">
              {competitor}
            </th>
          </tr>
        </thead>
        {categories.map((category) => (
          <tbody key={category}>
            <tr className="border-t border-hairline">
              <th scope="colgroup" colSpan={3} className="px-5 pt-6 pb-2 text-body-sm font-medium text-fg md:px-8">
                {category}
              </th>
            </tr>
            {rows
              .filter((row) => row.category === category)
              .map((row, index) => (
                <tr key={index} className="border-t border-wash-pill">
                  <th scope="row" className="px-5 py-3.5 text-body font-normal text-fg-nav md:px-8">
                    {row.feature}
                  </th>
                  <td className={cn("px-4 py-3.5 text-center", OURS_TINT)}>
                    <ComparisonSupportCell value={row.ours} ours />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <ComparisonSupportCell value={row.theirs} />
                  </td>
                </tr>
              ))}
          </tbody>
        ))}
      </TableCard>
    </SiteSection>
  );
}

export type ComparedPlan = { plan: React.ReactNode; price: React.ReactNode; credits: React.ReactNode; concurrency?: React.ReactNode; costPerThousand?: React.ReactNode };
export type PricingTier = { tier: React.ReactNode; ours: ComparedPlan; theirs: ComparedPlan };

function PlanCell({ plan, ours = false }: { plan: ComparedPlan; ours?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-body text-fg">
        {plan.plan} <span className="text-fg-muted">{plan.price}</span>
      </p>
      <p className="text-body-sm text-fg-muted">{plan.credits}</p>
      {plan.concurrency && <p className="text-body-sm text-fg-muted">{plan.concurrency}</p>}
      {plan.costPerThousand && (
        <p className="pt-1 text-body-sm">
          <span className={cn("font-medium", ours ? "text-fg-brand" : "text-fg-nav")}>{plan.costPerThousand}</span> <span className="text-fg-muted">per 1K pages</span>
        </p>
      )}
    </div>
  );
}

/** Plan by plan, side by side: a ringed table of tiers with each plan's price, credits, concurrency and unit cost, then numbered footnotes. */
function AlternativePricingTable({
  ours,
  competitor,
  tiers,
  footnotes,
  title = "Cost per",
  accent = "1,000 pages",
  description,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  ours: string;
  competitor: string;
  tiers: PricingTier[];
  /** Numbered notes under the table; `strong` sets one in the darker, medium weight. */
  footnotes?: { content: React.ReactNode; strong?: boolean }[];
  title?: React.ReactNode;
  accent?: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <SiteSection lines className={className} {...props}>
      <SectionHeading title={title} accent={accent} description={description} />
      <SectionHeaderRule />
      <TableCard label={`Cost per 1,000 pages on ${ours} and ${competitor}`} minWidth="min-w-160">
        <thead>
          <tr className="text-body-sm">
            <th scope="col" className="w-40 px-5 py-4 font-normal text-fg-muted md:px-8">
              Tier
            </th>
            <th scope="col" className={cn("px-5 py-4 font-medium text-fg-brand", OURS_TINT)}>
              {ours}
            </th>
            <th scope="col" className="px-5 py-4 font-normal text-fg">
              {competitor}
            </th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((row, index) => (
            <tr key={index} className="border-t border-wash-pill align-top">
              <th scope="row" className="px-5 py-5 text-body font-normal text-fg md:px-8">
                {row.tier}
              </th>
              <td className={cn("px-5 py-5", OURS_TINT)}>
                <PlanCell plan={row.ours} ours />
              </td>
              <td className="px-5 py-5">
                <PlanCell plan={row.theirs} />
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      {footnotes && footnotes.length > 0 && (
        <ol className="mt-8 flex max-w-3xl list-decimal flex-col gap-2 pl-5 text-body-sm text-fg-muted [&_strong]:font-medium [&_strong]:text-fg-nav">
          {footnotes.map((note, index) => (
            <li key={index} className={note.strong ? "font-medium text-fg-nav" : undefined}>
              {note.content}
            </li>
          ))}
        </ol>
      )}
    </SiteSection>
  );
}

export type FitColumn = { title: React.ReactNode; points: React.ReactNode[] };
export type SwitchStory = { quote: React.ReactNode; person: React.ReactNode; href?: string; linkLabel?: React.ReactNode };

// The fit guide's cards: white, the raised hairline shadow.
const FIT_CARD = "rounded-shell bg-surface p-7 shadow-raised md:p-8";

/**
 * Which one fits: a centered heading and line, two cards of bullet points ("Choose us if", "Choose them if"), then a
 * heading and two quotes from teams that switched.
 */
function AlternativeFitGuide({
  title = "Which one fits",
  description,
  columns,
  storiesTitle,
  stories = [],
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  columns: FitColumn[];
  storiesTitle?: React.ReactNode;
  stories?: SwitchStory[];
}) {
  return (
    <SiteSection lines className={cn("pt-16 pb-16 md:pt-24 md:pb-24", className)} {...props}>
      <div className="mb-12 flex flex-col items-center gap-5 text-center">
        <h2 className="text-h2 leading-tight font-normal tracking-tight text-fg md:text-h1">{title}</h2>
        {description && <p className="max-w-xl text-body-lg leading-relaxed text-fg-subtle [&_a]:text-fg-brand [&_a]:underline [&_a]:underline-offset-4">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        {columns.map((column, index) => (
          <div key={index} className={FIT_CARD}>
            <h3 className="text-body-lg leading-snug font-normal tracking-tight text-fg md:text-h5">{column.title}</h3>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-body leading-relaxed text-fg-subtle">
              {column.points.map((point, pointIndex) => (
                <li key={pointIndex}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {stories.length > 0 && (
        <>
          {storiesTitle && <h3 className="mt-16 mb-6 text-center text-h4 font-normal tracking-tight text-fg md:text-h3">{storiesTitle}</h3>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {stories.map((story, index) => (
              <figure key={index} className={cn(FIT_CARD, "flex flex-col justify-between gap-5")}>
                <blockquote className="text-body leading-relaxed text-fg-nav">“{story.quote}”</blockquote>
                <figcaption className="flex flex-col gap-2 text-body-sm">
                  <span className="font-medium text-fg">{story.person}</span>
                  {story.href && story.linkLabel && (
                    <a href={story.href} className="w-fit rounded-sm font-medium text-fg-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus-ring">
                      {story.linkLabel}
                    </a>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </SiteSection>
  );
}

export { ComparisonSupportCell, AlternativeQuickCompare, AlternativeReasons, AlternativeComparisonTable, AlternativePricingTable, AlternativeFitGuide };
