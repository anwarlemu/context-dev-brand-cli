import * as React from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

// The use case pages' feature sections: white cards in the soft blue ring, each with an optional marker (an icon on a
// blue tile, a dot glyph, a badge), a title that can link, a line of description, tags, a code chip with a technical
// detail, and a dot story in a demo window at its foot (or beside it, when the cards run one to a row). Then the note
// card that can close the section, the comparison table with one column highlighted, and the before and after panels.

// The ring is a wrapper rather than a shadow, so its outer edge shares the card's radius. Its negative margin keeps it
// from adding layout size.
const RING = "-m-2 rounded-card bg-ring-tint p-2";
const CARD = "flex h-full min-w-0 flex-col gap-4 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8";
const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";

export type UseCaseFeature = {
  title: string;
  description: React.ReactNode;
  href?: string;
  /** A line icon, drawn white on a blue tile. */
  icon?: React.ReactNode;
  /** A dot glyph in place of the icon (the site's animated persona glyphs). */
  glyph?: React.ReactNode;
  badge?: string;
  tags?: readonly string[];
  /** A short technical detail shown as a code chip, such as the endpoint or the monitor target. */
  meta?: string;
  /** A dot story or demo, framed at the foot of the card (or beside it in rows). */
  story?: React.ReactNode;
};

/** The blue tile a feature's or persona's line icon sits on. */
function UseCaseIconChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-card bg-brand text-white [&_svg]:size-5", className)}>{children}</span>;
}

/**
 * A card's demo window: a white window in a blue-tint frame with the window's own radius, and the stage inside it where a
 * dot story plays, centered at most 26rem wide. `backdrop` takes the ring pattern the site draws behind the story;
 * `footer` sits under the stage in the same window (the stage then keeps its own height and the footer takes the rest).
 */
function UseCaseDemoFrame({ children, backdrop, footer, className }: { children: React.ReactNode; backdrop?: React.ReactNode; footer?: React.ReactNode; className?: string }) {
  const stage = (
    <div className="relative isolate flex min-h-88 flex-1 items-center justify-center px-4 py-8 select-none sm:px-9">
      {backdrop && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {backdrop}
        </div>
      )}
      <div className="relative w-full max-w-104">{children}</div>
    </div>
  );
  return (
    <div className={cn("relative mt-auto flex flex-1 flex-col rounded-card bg-brand/10 p-2", className)}>
      <div className="flex flex-1 flex-col overflow-hidden rounded-card bg-surface">
        {footer ? <div className="flex flex-col">{stage}</div> : stage}
        {footer}
      </div>
    </div>
  );
}

function UseCaseFeatureCard({ feature, row = false, className }: { feature: UseCaseFeature; row?: boolean; className?: string }) {
  const { title, description, href, icon, glyph, badge, tags, meta, story } = feature;
  const heading = (
    <span className="flex items-center gap-2">
      {title}
      {href && <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-fg-brand" />}
    </span>
  );
  return (
    <div data-slot="use-case-feature-card" className={cn(CARD, row && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center lg:gap-12", className)}>
      <div className={cn("flex flex-col gap-4", row ? "max-w-md" : "flex-1")}>
        {(icon || glyph || badge) && (
          <div className="flex items-center justify-between gap-4">
            {glyph ?? (icon && <UseCaseIconChip>{icon}</UseCaseIconChip>)}
            {badge && <span className="rounded-pill bg-brand/10 px-3 py-1 text-body-sm text-fg-brand">{badge}</span>}
          </div>
        )}
        <h3 className="text-h4 font-normal text-fg">
          {href ? (
            <a href={href} className={cn("rounded-sm transition-[color] duration-150 ease-out hover:text-fg-brand motion-reduce:transition-none", FOCUS)}>
              {heading}
            </a>
          ) : (
            heading
          )}
        </h3>
        <p className="text-body text-fg-secondary">{description}</p>
        {tags && tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li key={tag} className="rounded-pill px-3 py-1 text-body-sm text-fg-nav ring-1 ring-black/10 ring-inset">
                {tag}
              </li>
            ))}
          </ul>
        )}
        {meta && <code className={cn("w-fit rounded-pill bg-wash-hover px-3 py-1.5 font-mono text-body-sm text-fg-nav", !story && "mt-auto")}>{meta}</code>}
      </div>
      {story && (
        <div className={cn("flex flex-col", !row && "mt-4 flex-1")}>
          <UseCaseDemoFrame>{story}</UseCaseDemoFrame>
        </div>
      )}
    </div>
  );
}

/**
 * The cards: three across when they divide by three, two across otherwise, or one to a row (`layout="rows"`) with each
 * card's story beside its text.
 */
function UseCaseFeatureCards({ items, layout = "grid", className }: { items: readonly UseCaseFeature[]; layout?: "grid" | "rows"; className?: string }) {
  const rows = layout === "rows";
  return (
    <ul data-slot="use-case-feature-cards" className={cn("grid grid-cols-1 gap-6", !rows && (items.length % 3 === 0 ? "lg:grid-cols-3" : "md:grid-cols-2"), className)}>
      {items.map((feature) => (
        <li key={feature.title} className={RING}>
          <UseCaseFeatureCard feature={feature} row={rows} />
        </li>
      ))}
    </ul>
  );
}

/** A closing note under the cards, with a small glyph (or icon tile) standing for the API it points to. */
function UseCaseNote({ glyph, children, className }: { glyph?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div data-slot="use-case-note" className={cn(RING, "mt-6", className)}>
      <div className="flex items-center gap-4 rounded-card bg-surface p-6 ring-1 ring-hairline md:px-8">
        {glyph}
        <p className="text-body-lg text-fg-secondary">{children}</p>
      </div>
    </div>
  );
}

export type UseCaseComparisonColumn = { key: string; header: React.ReactNode; caption?: React.ReactNode; highlight?: boolean };
export type UseCaseComparisonRow = { feature: React.ReactNode } & Record<string, React.ReactNode>;

/**
 * The comparison table: the features down the left, a column per option, the highlighted one (Context.dev) in brand blue
 * on a faint blue wash. It scrolls sideways on narrow screens rather than squeezing the columns.
 */
function UseCaseComparisonTable({ columns, rows, label = "Comparison", className }: { columns: readonly UseCaseComparisonColumn[]; rows: readonly UseCaseComparisonRow[]; label?: string; className?: string }) {
  return (
    <div data-slot="use-case-comparison-table" className={cn(RING, className)}>
      <div tabIndex={0} role="region" aria-label={label} className={cn("overflow-x-auto rounded-card bg-surface ring-1 ring-hairline", FOCUS)}>
        <table className="w-full min-w-xl border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline align-bottom">
              <td className="w-1/4 px-6 py-5 md:px-8" />
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cn("px-6 py-5 font-normal md:px-8", column.highlight && "bg-brand/4")}>
                  <span className={cn("block text-h5", column.highlight ? "text-fg-brand" : "text-fg")}>{column.header}</span>
                  {column.caption && <span className="block text-body-sm text-fg-subtle">{column.caption}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-black/6 last:border-0">
                <th scope="row" className="px-6 py-5 align-top text-body font-normal text-fg md:px-8">
                  {row.feature}
                </th>
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-6 py-5 align-top text-body md:px-8", column.highlight ? "bg-brand/4 text-fg" : "text-fg-secondary")}>
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const PANEL_TONES = {
  before: { label: "Without Context.dev", labelClass: "text-fg-muted ring-1 ring-black/10 ring-inset" },
  after: { label: "With Context.dev", labelClass: "bg-brand/10 text-fg-brand" },
} as const;

/** One side of a before and after: a label chip, a title and whatever shows the difference. */
function BeforeAfterPanel({ tone, label, title, className, children }: { tone: keyof typeof PANEL_TONES; label?: string; title: React.ReactNode; className?: string; children: React.ReactNode }) {
  const preset = PANEL_TONES[tone];
  return (
    <section aria-label={label ?? preset.label} data-slot="before-after-panel" className={cn("flex min-w-0 flex-col gap-5 rounded-card bg-surface p-5 ring-1 ring-hairline sm:p-6 md:p-7", className)}>
      <span className={cn("w-fit rounded-pill px-3 py-1 text-body-sm", preset.labelClass)}>{label ?? preset.label}</span>
      <h3 className="text-h4 font-normal text-fg">{title}</h3>
      {children}
    </section>
  );
}

function BeforeAfterPanels({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-2", className)}>{children}</div>;
}

/** The numbers under a before and after, one of them in brand blue. */
function BeforeAfterStats({ stats, accentIndex = 0, className }: { stats: readonly { label: string; value: string }[]; accentIndex?: number; className?: string }) {
  return (
    <dl className={cn("mt-6 grid grid-cols-1 rounded-card bg-surface ring-1 ring-hairline sm:grid-cols-3", className)}>
      {stats.map((stat, i) => (
        <div key={stat.label} className={cn("flex flex-col gap-1 px-6 py-5", i > 0 && "border-t border-black/6 sm:border-t-0 sm:border-l")}>
          <dt className="text-body-sm text-fg-subtle">{stat.label}</dt>
          <dd className={cn("text-h3 leading-none tracking-tight", i === accentIndex ? "text-fg-brand" : "text-fg")}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export { UseCaseFeatureCards, UseCaseFeatureCard, UseCaseIconChip, UseCaseDemoFrame, UseCaseNote, UseCaseComparisonTable, BeforeAfterPanels, BeforeAfterPanel, BeforeAfterStats };
