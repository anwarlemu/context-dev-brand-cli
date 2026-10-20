import * as React from "react";
import { ArrowRight, Check } from "lucide-react";

import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { PersonaGlyph, type PersonaGlyphName } from "@/components/visuals/persona-glyph";
import { cn } from "@/lib/utils";

// The compare pages ("The top Firecrawl alternative"): the site's Hero with a cost card in its blue frame, the logo
// strip, then why switch, what one request really costs, the full comparison, the cost per 1,000 pages, which one
// fits, the FAQ, more comparisons and the closing call to action. Every table is a white card in the soft blue ring,
// our column tinted blue; a yes is a check (blue for us, gray for them), a no is a faint dash, and a string is shown
// as is. Everything is set in the regular weight; our side is told apart by color alone.

export type ComparisonSupport = boolean | string;

/** One comparison cell: a check, a dash, or a short note. `ours` paints it blue. */
function ComparisonSupportCell({ value, ours = false }: { value: ComparisonSupport; ours?: boolean }) {
  if (typeof value === "string") return <span className={cn("text-body-sm", ours ? "text-fg-brand" : "text-fg-nav")}>{value}</span>;
  if (value) {
    return (
      <span className="inline-flex justify-center">
        <Check aria-hidden="true" className={cn("size-5", ours ? "text-fg-brand" : "text-black/45")} />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  return (
    <span className="text-body-sm text-black/30">
      <span aria-hidden="true">–</span>
      <span className="sr-only">No</span>
    </span>
  );
}

// The ringed white table card: the ring is the wrapper's tint, so it shares the card's radius and adds no size.
function TableCard({ label, minWidth, children }: { label: string; minWidth: string; children: React.ReactNode }) {
  return (
    <div className="-m-2 rounded-card bg-ring-tint p-2">
      <div tabIndex={0} role="region" aria-label={label} className="overflow-x-auto rounded-card bg-surface ring-1 ring-hairline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
        <table className={cn("w-full border-collapse text-left leading-normal", minWidth)}>{children}</table>
      </div>
    </div>
  );
}

const OURS_TINT = "bg-brand/4";

// Links inside a section's description are blue and underlined, as the site writes them.
const DESCRIPTION_LINKS = "[&_a]:text-fg-brand [&_a]:underline [&_a]:underline-offset-4";

function describe(description: React.ReactNode) {
  return description ? <span className={DESCRIPTION_LINKS}>{description}</span> : undefined;
}

export type CostBarSide = { amount: number; display: React.ReactNode; detail?: React.ReactNode; /** An amber flag beside the figure ("4x fewer"). */ flag?: React.ReactNode };
export type CostMetric = { label: React.ReactNode; ours: CostBarSide; theirs: CostBarSide };

// A bar for a tiny amount next to a huge one still has to read as a bar.
const MIN_BAR_PERCENT = 2;

function CostBarRow({ name, side, max, ours }: { name: React.ReactNode; side: CostBarSide; max: number; ours: boolean }) {
  const width = `${Math.max(MIN_BAR_PERCENT, max > 0 ? (side.amount / max) * 100 : 0)}%`;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[7rem_minmax(0,1fr)_15rem]">
      <span className={cn("col-start-1 row-start-1 text-body", ours ? "text-fg-brand" : "text-fg")}>{name}</span>
      <span aria-hidden="true" className="col-span-2 row-start-2 h-2.5 rounded-pill bg-wash-control sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-3">
        <span className={cn("block h-full rounded-pill", ours ? "bg-brand" : "bg-black/25")} style={{ width }} />
      </span>
      <span className="col-start-2 row-start-1 flex flex-col items-end text-right sm:col-start-3">
        <span className="flex items-center gap-2">
          {side.flag && <span className="rounded-pill bg-caution px-2 py-0.5 text-caption whitespace-nowrap text-fg-caution tabular-nums">{side.flag}</span>}
          <span className={cn("text-body-lg whitespace-nowrap tabular-nums", ours ? "text-fg-brand" : "text-fg")}>{side.display}</span>
        </span>
        {side.detail && <span className="text-caption text-fg-nav max-sm:hidden">{side.detail}</span>}
      </span>
    </div>
  );
}

/**
 * The hero's cost card, for the hero's blue frame (HeroMedia): a title and note, then each metric as two bars (ours
 * blue, theirs gray) with the figure and its detail, and a footnote. The hero is one screen tall, so on phones and short
 * laptop screens the card keeps to its first metric; the request costs further down repeat every figure.
 */
function AlternativeCostCard({
  ours,
  competitor,
  title,
  note,
  metrics,
  footnote,
  className,
}: {
  ours: React.ReactNode;
  competitor: React.ReactNode;
  title: React.ReactNode;
  note?: React.ReactNode;
  metrics: CostMetric[];
  footnote?: React.ReactNode;
  className?: string;
}) {
  const secondary = "max-sm:hidden [@media(max-height:860px)]:hidden";
  return (
    <div data-slot="alternative-cost-card" className={cn("flex w-full flex-col gap-5 rounded-[var(--ds-space-4)] bg-surface p-5 text-left sm:p-7 sm:pb-6", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-body-lg text-fg">{title}</p>
        {note && <p className="text-body-sm text-fg-nav max-sm:hidden">{note}</p>}
      </div>
      {metrics.map((metric, index) => {
        const max = Math.max(metric.ours.amount, metric.theirs.amount);
        return (
          <figure key={index} className={cn("flex flex-col gap-2.5", index > 0 && secondary)}>
            <figcaption className="text-body-sm text-fg-muted">{metric.label}</figcaption>
            <CostBarRow name={ours} side={metric.ours} max={max} ours />
            <CostBarRow name={competitor} side={metric.theirs} max={max} ours={false} />
          </figure>
        );
      })}
      {footnote && <p className={cn("border-t border-hairline pt-4 text-body-sm text-fg-nav", secondary)}>{footnote}</p>}
    </div>
  );
}

export type QuickCompareRow = { feature: string; ours: ComparisonSupport; theirs: ComparisonSupport };

/**
 * A quick three-column comparison for the hero's blue frame (HeroMedia), the rows past the third hidden on phones.
 * @deprecated The site's compare hero now shows AlternativeCostCard; kept so existing pages render.
 */
function AlternativeQuickCompare({ ours, competitor, rows, rowsOnPhones = 3, className }: { ours: string; competitor: string; rows: QuickCompareRow[]; rowsOnPhones?: number; className?: string }) {
  return (
    <div data-slot="alternative-quick-compare" className={cn("w-full overflow-hidden rounded-card bg-surface text-left", className)}>
      <table className="w-full border-collapse leading-snug">
        <thead>
          <tr className="text-caption sm:text-body-sm">
            <th scope="col" className="px-4 py-3 font-normal text-fg-nav sm:px-6">
              Feature
            </th>
            <th scope="col" className="w-22 px-1 py-3 text-center font-normal text-fg-brand sm:w-36 sm:px-3">
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
              <th scope="row" className="px-4 py-3 text-body-sm font-normal text-black/75 sm:px-6 sm:py-3.5 sm:text-body">
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
      <span className="w-fit rounded-pill bg-ring-tint px-3 py-1 text-body-sm leading-snug text-fg-brand">{reason.tag}</span>
      <h3 className={cn("font-normal tracking-normal text-fg", featured ? "max-w-3xl text-h3 leading-heading" : "text-h4 leading-snug")}>{reason.title}</h3>
      <p className={cn("text-fg-secondary", featured ? "max-w-3xl text-body-lg leading-snug" : "text-body leading-snug")}>{reason.body}</p>
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
      <SectionHeading title={title} accent={accent} description={describe(description)} />
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

/** How a request's price compares: about the same, cheaper or dearer for them, or an extra they charge for. */
export type RequestCostTone = "same" | "less" | "more" | "extra";
export type RequestCostRow = { request: React.ReactNode; detail?: React.ReactNode; ours: React.ReactNode; theirs: React.ReactNode; difference: React.ReactNode; tone: RequestCostTone };

const TONE_CHIP: Record<RequestCostTone, string> = {
  same: "bg-wash-hover text-fg-nav",
  less: "bg-wash-hover text-fg-secondary",
  more: "bg-caution text-fg-caution",
  extra: "bg-caution text-fg-caution",
};

/**
 * What one request really costs: a ringed table of request types, each with a line of detail, our price (tinted), theirs
 * and the difference as a pill (amber where they charge more or extra), then a footnote on where the figures come from.
 */
function AlternativeRequestCosts({
  ours,
  competitor,
  rows,
  footnote,
  title = "What one request",
  accent = "really costs",
  description,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & { ours: string; competitor: string; rows: RequestCostRow[]; footnote?: React.ReactNode; title?: React.ReactNode; accent?: React.ReactNode; description?: React.ReactNode }) {
  return (
    <SiteSection lines className={className} {...props}>
      <SectionHeading title={title} accent={accent} description={describe(description)} />
      <SectionHeaderRule />
      <TableCard label={`Price per request type on ${ours} and ${competitor}`} minWidth="min-w-176">
        <thead>
          <tr className="text-body-sm">
            <th scope="col" className="px-5 py-4 font-normal text-fg-nav md:px-8">
              Request
            </th>
            <th scope="col" className={cn("w-44 px-5 py-4 font-normal text-fg-brand", OURS_TINT)}>
              {ours}
            </th>
            <th scope="col" className="w-52 px-5 py-4 font-normal text-fg">
              {competitor}
            </th>
            <th scope="col" className="w-36 px-5 py-4 text-right font-normal text-fg-nav md:pr-8">
              Difference
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-wash-pill">
              <th scope="row" className="px-5 py-4 font-normal md:px-8">
                <span className="block text-body text-black/75">{row.request}</span>
                {row.detail && <span className="mt-0.5 block text-body-sm text-fg-nav">{row.detail}</span>}
              </th>
              <td className={cn("px-5 py-4 text-body text-fg-brand tabular-nums", OURS_TINT)}>{row.ours}</td>
              <td className="px-5 py-4 text-body text-fg tabular-nums">{row.theirs}</td>
              <td className="px-5 py-4 text-right md:pr-8">
                <span className={cn("inline-block rounded-pill px-2.5 py-0.5 text-body-sm whitespace-nowrap tabular-nums", TONE_CHIP[row.tone])}>{row.difference}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      {footnote && <p className="mt-6 max-w-3xl text-body-sm text-fg-nav">{footnote}</p>}
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
            <th scope="col" className="px-5 py-4 font-normal text-fg-nav md:px-8">
              Feature
            </th>
            <th scope="col" className={cn("w-36 px-4 py-4 text-center font-normal text-fg-brand md:w-44", OURS_TINT)}>
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
              <th scope="colgroup" colSpan={3} className="px-5 pt-6 pb-2 text-body-sm font-normal text-fg md:px-8">
                {category}
              </th>
            </tr>
            {rows
              .filter((row) => row.category === category)
              .map((row, index) => (
                <tr key={index} className="border-t border-wash-pill">
                  <th scope="row" className="px-5 py-3.5 text-body font-normal text-black/75 md:px-8">
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

/** One unit cost under a plan, e.g. "$0.79" "per 1,000 pages". `emphasis` sets theirs in black rather than gray. */
export type PlanCostLine = { amount: React.ReactNode; label: React.ReactNode; emphasis?: boolean };
export type ComparedPlan = {
  plan: React.ReactNode;
  price: React.ReactNode;
  credits: React.ReactNode;
  concurrency?: React.ReactNode;
  /** One figure per 1,000 pages; `costLines` takes over when given. */
  costPerThousand?: React.ReactNode;
  costLines?: PlanCostLine[];
};
/** A competitor tier with no matching plan: the note shown in its cell. */
export type MissingPlan = { missing: React.ReactNode };
export type PricingTier = { tier: React.ReactNode; ours: ComparedPlan; theirs: ComparedPlan | MissingPlan };

function PlanCell({ plan, ours = false }: { plan: ComparedPlan; ours?: boolean }) {
  const lines: PlanCostLine[] = plan.costLines ?? (plan.costPerThousand ? [{ amount: plan.costPerThousand, label: "per 1K pages", emphasis: true }] : []);
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-body text-fg">
        {plan.plan} <span className="text-fg-nav">{plan.price}</span>
      </p>
      <p className="text-body-sm text-fg-nav">{plan.credits}</p>
      {plan.concurrency && <p className="text-body-sm text-fg-nav">{plan.concurrency}</p>}
      {lines.map((line, index) => (
        <p key={index} className={cn("text-body-sm", index === 0 && "pt-1")}>
          <span className={cn("tabular-nums", ours ? "text-fg-brand" : line.emphasis ? "text-fg" : "text-fg-muted")}>{line.amount}</span> <span className="text-fg-nav">{line.label}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Plan by plan, side by side: a ringed table of tiers with each plan's price, credits, concurrency and unit cost, then
 * numbered footnotes (a `strong` one in black) and, with `checkedOn`, when the prices were checked.
 */
function AlternativePricingTable({
  ours,
  competitor,
  tiers,
  footnotes,
  checkedOn,
  title = "Cost per",
  accent = "1,000 pages",
  description,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  ours: string;
  competitor: string;
  tiers: PricingTier[];
  /** Numbered notes under the table; `strong` sets one in black, as the site sets its first. */
  footnotes?: { content: React.ReactNode; strong?: boolean }[];
  /** When the prices were checked: its ISO date for the time element and its label. */
  checkedOn?: { iso: string; label: React.ReactNode };
  title?: React.ReactNode;
  accent?: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <SiteSection lines className={className} {...props}>
      <SectionHeading title={title} accent={accent} description={describe(description)} />
      <SectionHeaderRule />
      <TableCard label={`Cost per 1,000 pages on ${ours} and ${competitor}`} minWidth="min-w-160">
        <thead>
          <tr className="text-body-sm">
            <th scope="col" className="w-40 px-5 py-4 font-normal text-fg-nav md:px-8">
              Tier
            </th>
            <th scope="col" className={cn("px-5 py-4 font-normal text-fg-brand", OURS_TINT)}>
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
              <td className="px-5 py-5">{"missing" in row.theirs ? <p className="text-body-sm text-fg-nav">{row.theirs.missing}</p> : <PlanCell plan={row.theirs} />}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      {footnotes && footnotes.length > 0 && (
        <ol className="mt-8 flex max-w-3xl list-decimal flex-col gap-2 pl-5 text-body-sm text-fg-nav [&_strong]:font-normal [&_strong]:text-fg">
          {footnotes.map((note, index) => (
            <li key={index} className={note.strong ? "text-fg" : undefined}>
              {note.content}
            </li>
          ))}
        </ol>
      )}
      {checkedOn && (
        <p className="mt-4 max-w-3xl text-body-sm text-fg-nav">
          Prices and plans checked on <time dateTime={checkedOn.iso}>{checkedOn.label}</time>.
        </p>
      )}
    </SiteSection>
  );
}

export type FitColumn = { title: React.ReactNode; points: React.ReactNode[] };
export type SwitchStory = { quote: React.ReactNode; person: React.ReactNode; href?: string; linkLabel?: React.ReactNode };

// The fit guide's cards: white with a hairline ring, in the soft blue ring.
const FIT_CARD = "h-full rounded-card bg-surface p-7 ring-1 ring-hairline md:p-8";

/**
 * Which one fits: the section heading ("Which one fits", the last word blue) and a line, two cards of points ("Choose
 * us if" in blue, "Choose them if"), each point beside a small dot (blue for us, gray for them), then a heading and
 * quotes from teams that switched.
 */
function AlternativeFitGuide({
  title,
  accent,
  description,
  columns,
  storiesTitle,
  stories = [],
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  /** The heading's first words; "Which one" by default, with `accent` "fits" in blue. */
  title?: React.ReactNode;
  accent?: React.ReactNode;
  description?: React.ReactNode;
  columns: FitColumn[];
  storiesTitle?: React.ReactNode;
  stories?: SwitchStory[];
}) {
  // A page that passed its whole heading as `title` (the old "Which one fits") keeps it without a second blue word.
  const heading = title ?? "Which one";
  const highlight = accent ?? (title === undefined ? "fits" : undefined);
  return (
    <SiteSection lines className={className} {...props}>
      <SectionHeading title={heading} accent={highlight} description={describe(description)} />
      <SectionHeaderRule />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        {columns.map((column, index) => (
          <div key={index} className="-m-2 rounded-card bg-ring-tint p-2">
            <div className={FIT_CARD}>
              <h3 className={cn("text-h4 leading-snug font-normal tracking-normal", index === 0 ? "text-fg-brand" : "text-fg")}>{column.title}</h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {column.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex gap-3 text-body leading-snug text-fg-secondary">
                    <span aria-hidden="true" className={cn("mt-[calc(var(--ds-space-2)*1.1)] size-1.5 shrink-0 rounded-pill", index === 0 ? "bg-brand" : "bg-black/30")} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      {stories.length > 0 && (
        <>
          {storiesTitle && <h3 className="mt-14 mb-6 text-h4 leading-snug font-normal tracking-normal text-fg">{storiesTitle}</h3>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {stories.map((story, index) => (
              <div key={index} className="-m-2 rounded-card bg-ring-tint p-2">
                <figure className={cn(FIT_CARD, "flex flex-col justify-between gap-5")}>
                  <blockquote className="text-body leading-snug text-fg-nav">“{story.quote}”</blockquote>
                  <figcaption className="flex flex-col gap-2 text-body-sm">
                    <span className="text-fg">{story.person}</span>
                    {story.href && story.linkLabel && (
                      <a href={story.href} className="w-fit rounded-sm text-fg-brand outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
                        {story.linkLabel}
                      </a>
                    )}
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </>
      )}
    </SiteSection>
  );
}

export type ComparisonLink = { href: string; title: React.ReactNode; description: React.ReactNode; glyph: PersonaGlyphName };

/**
 * A link to another comparison: a white card with a blue glyph tile, an arrow, the title and a line. On hover the ring
 * turns blue and the title and arrow take the brand color; nothing moves.
 */
function ComparisonLinkCard({ item, index = 0, className }: { item: ComparisonLink; index?: number; className?: string }) {
  return (
    <a
      href={item.href}
      data-slot="comparison-link-card"
      className={cn(
        "group flex h-full flex-col gap-4 rounded-card bg-surface p-6 ring-1 ring-hairline outline-none transition-shadow duration-200 ease-out hover:ring-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none",
        className,
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <PersonaGlyph name={item.glyph} index={index} className="size-10 rounded-card p-3" />
        <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-black/25 transition-colors duration-200 ease-out group-hover:text-fg-brand motion-reduce:transition-none" />
      </span>
      <span className="text-body-lg text-fg transition-colors duration-200 ease-out group-hover:text-fg-brand motion-reduce:transition-none">{item.title}</span>
      <span className="text-body-sm text-fg-nav">{item.description}</span>
    </a>
  );
}

/** More comparisons: the section heading and a line, then link cards three across, each in the soft blue ring. */
function AlternativeRelated({
  items,
  title = "More",
  accent = "comparisons",
  description,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & { items: ComparisonLink[]; title?: React.ReactNode; accent?: React.ReactNode; description?: React.ReactNode }) {
  if (items.length === 0) return null;
  return (
    <SiteSection lines className={className} {...props}>
      <SectionHeading title={title} accent={accent} description={describe(description)} />
      <SectionHeaderRule />
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.href} className="-m-2 rounded-card bg-ring-tint p-2">
            <ComparisonLinkCard item={item} index={index} />
          </li>
        ))}
      </ul>
    </SiteSection>
  );
}

export {
  ComparisonSupportCell,
  AlternativeCostCard,
  AlternativeQuickCompare,
  AlternativeReasons,
  AlternativeRequestCosts,
  AlternativeComparisonTable,
  AlternativePricingTable,
  AlternativeFitGuide,
  AlternativeRelated,
  ComparisonLinkCard,
};
