"use client";

import * as React from "react";
import { ArrowRight, Check, Copy, Minus, Plus } from "lucide-react";

import { useCopy } from "@/components/ui/copy-button";
import { CodeBlock } from "@/components/site/code-window";
import { cn } from "@/lib/utils";

// A product page on the stage design (the Search, Brand search, People enrichment, News and Parse pages): a wide
// column with no ruled frame, a split heading (the first line black, the second brand blue), the product on a blue
// stage under the hero, and quiet gray panels, hairline lists and a tabbed code explorer below. Everything is data
// through props; the stage's picture and its glass backdrop are slots.

// ---------------------------------------------------------------------------------------------------------------------
// Layout

/** A full-width band with the content in the page's wide column. */
function ProductPageSection({ className, containerClassName, children, ...props }: React.ComponentProps<"section"> & { containerClassName?: string }) {
  return (
    <section data-slot="product-page-section" className={cn("relative w-full", className)} {...props}>
      <div className={cn("mx-auto w-full max-w-(--ds-layout-column-wide) px-6 sm:px-10 lg:px-16", containerClassName)}>{children}</div>
    </section>
  );
}

/** The two-line heading: the first line in black, the second in brand blue. */
function ProductSplitHeading({ title, as: Heading = "h2", className, ...props }: Omit<React.ComponentProps<"h2">, "title"> & { title: readonly [React.ReactNode, React.ReactNode]; as?: "h1" | "h2" }) {
  return (
    <Heading data-slot="product-split-heading" className={cn("text-h3 leading-display font-normal tracking-tight sm:text-h2 lg:text-h1", className)} {...props}>
      <span className="block text-balance text-fg">{title[0]}</span> <span className="block text-balance text-fg-brand">{title[1]}</span>
    </Heading>
  );
}

/** A section's opening row: the split heading on the left and a short paragraph bottom-aligned on the right. */
function ProductSectionHeader({ id, title, description, className }: { id?: string; title: readonly [React.ReactNode, React.ReactNode]; description?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-16", className)}>
      <ProductSplitHeading id={id} title={title} />
      {description && <p className="max-w-100 shrink-0 text-body-lg leading-relaxed text-pretty text-fg-muted lg:pb-1.5">{description}</p>}
    </div>
  );
}

const PILL =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-pill text-body leading-snug font-medium outline-none transition-[background-color,border-color,color,scale] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

const PILL_TONES = {
  primary: {
    dark: "bg-primary px-6 text-on-primary hover:bg-primary-hover focus-visible:ring-focus-ring",
    light: "bg-white px-6 text-fg hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-brand",
  },
  secondary: {
    dark: "border border-rule bg-surface pr-5 pl-6 text-fg hover:bg-subtle focus-visible:ring-focus-ring",
    light: "border border-white/35 bg-white/15 pr-5 pl-6 text-white hover:bg-white/25 focus-visible:ring-white focus-visible:ring-offset-brand",
  },
} as const;

/**
 * The stage design's pills: `primary` is black (white on blue), `secondary` a white pill with a hairline and an arrow
 * (translucent white on blue). `tone="light"` is for the blue stage and panels.
 */
function ProductPillLink({
  variant = "primary",
  tone = "dark",
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & { variant?: "primary" | "secondary"; tone?: "dark" | "light" }) {
  return (
    <a data-slot="product-pill-link" className={cn(PILL, PILL_TONES[variant][tone], className)} {...props}>
      {children}
      {variant === "secondary" && <ArrowRight aria-hidden="true" className="size-4 shrink-0" />}
    </a>
  );
}

/** A blue text link with an arrow that steps right on hover. */
function ArrowTextLink({ className, children, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="arrow-text-link"
      className={cn("group flex w-fit items-center gap-2 rounded-sm text-body leading-snug font-medium text-fg-brand outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2", className)}
      {...props}
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </a>
  );
}

/**
 * The blue stage the product's picture sits on. `backdrop` layers behind it (the site's glass texture and a navy
 * scrim); without one it is flat brand blue.
 */
function ProductStage({ backdrop, className, children, ...props }: React.ComponentProps<"div"> & { backdrop?: React.ReactNode }) {
  return (
    <div data-slot="product-stage" className={cn("relative isolate overflow-hidden rounded-shell bg-brand sm:rounded-panel", className)} {...props}>
      {backdrop && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {backdrop}
        </div>
      )}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Hero

/**
 * The stage hero: the split title large and left aligned, the description and the two pills in a row under it, then
 * the product's picture on the blue stage with an optional mono caption along its foot.
 */
function ProductStageHero({
  title,
  description,
  actions,
  caption,
  backdrop,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title: readonly [React.ReactNode, React.ReactNode];
  description?: React.ReactNode;
  /** The pills (ProductPillLink): "Get API key" and "View documentation". */
  actions?: React.ReactNode;
  caption?: React.ReactNode;
  backdrop?: React.ReactNode;
}) {
  const titleId = React.useId();
  return (
    <ProductPageSection aria-labelledby={titleId} className={cn("pt-12 sm:pt-16 lg:pt-24", className)} {...props}>
      <div className="flex flex-col gap-8 lg:gap-10">
        <h1 id={titleId} className="text-h2 leading-tight font-normal tracking-tight sm:text-h1 lg:text-hero">
          <span className="block text-balance text-fg">{title[0]}</span> <span className="block text-balance text-fg-brand">{title[1]}</span>
        </h1>
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:gap-14">
          {description && <p className="max-w-136 shrink-0 text-body-lg leading-relaxed text-pretty text-fg-muted sm:text-h5">{description}</p>}
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </div>
      <ProductStage
        backdrop={backdrop}
        className="mt-12 flex flex-col items-center gap-5 px-3 pt-3 pb-5 sm:px-8 sm:pt-8 sm:pb-7 lg:mt-16 lg:min-h-165 lg:justify-center lg:px-10 lg:py-16"
      >
        {children}
        {caption && <p className="w-full font-mono text-caption text-white/85 lg:absolute lg:inset-x-8 lg:bottom-6 lg:w-auto">{caption}</p>}
      </ProductStage>
    </ProductPageSection>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Proof and figures

export type ProductCustomerLogo = { name: string; src: string };

/** A line of proof on the left (a backer's mark and a sentence) and the customers' logos, gray, on the right. */
function ProductCustomerRow({ lead, logos, className }: { lead?: React.ReactNode; logos: ProductCustomerLogo[]; className?: string }) {
  return (
    <ProductPageSection aria-label="Customers" className={cn("pt-10 lg:pt-14", className)} containerClassName="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
      {lead && <p className="flex min-w-0 items-center gap-3 text-body text-fg-muted [&_img]:size-5.5 [&_img]:shrink-0 [&_img]:rounded-sm">{lead}</p>}
      <ul role="list" className="grid w-full shrink-0 grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:w-auto sm:items-center sm:gap-8 xl:gap-12">
        {logos.map((logo) => (
          <li key={logo.name} className="flex h-7.5 items-center sm:w-28">
            <img src={logo.src} alt={logo.name} className="h-7.5 w-28 object-contain opacity-45 brightness-0 grayscale" />
          </li>
        ))}
      </ul>
    </ProductPageSection>
  );
}

export type ProductStat = { value: React.ReactNode; label: React.ReactNode };

/** Four figures on a gray panel, hairlines between them; the last figure is brand blue. */
function ProductStats({ stats, className }: { stats: ProductStat[]; className?: string }) {
  return (
    <ProductPageSection aria-label="At a glance" className={cn("pt-16 lg:pt-24", className)}>
      <dl className="grid grid-cols-2 gap-y-8 rounded-shell bg-subtle py-8 lg:grid-cols-4 lg:py-10">
        {stats.map((stat, index) => (
          <div key={index} className={cn("flex flex-col-reverse justify-end gap-2 px-6 xl:px-10", index % 2 === 1 ? "border-l border-rule" : index > 0 && "lg:border-l lg:border-rule")}>
            <dt className="text-body-lg leading-normal text-fg-muted">{stat.label}</dt>
            <dd className={cn("text-h3 leading-tight tracking-tight sm:text-h2 xl:text-h1", index === stats.length - 1 ? "text-fg-brand" : "text-fg")}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </ProductPageSection>
  );
}

export type ProductCapability = { title: React.ReactNode; description: React.ReactNode };

/** Three capabilities in columns, each under a hairline whose first stretch is brand blue. */
function ProductCapabilityList({ capabilities, label, className }: { capabilities: ProductCapability[]; label?: string; className?: string }) {
  return (
    <ProductPageSection aria-label={label} className={cn("pt-20 lg:pt-32", className)}>
      <dl className="grid gap-10 md:grid-cols-3 md:gap-12">
        {capabilities.map((capability, index) => (
          <div key={index} className="flex min-w-0 flex-col gap-3.5">
            <dt className="flex flex-col gap-7 text-h4 leading-snug tracking-tight text-fg">
              <span aria-hidden="true" className="flex h-px bg-rule">
                <span className="w-12 bg-brand" />
              </span>
              <span>{capability.title}</span>
            </dt>
            <dd className="text-body-lg leading-relaxed text-pretty text-fg-muted">{capability.description}</dd>
          </div>
        ))}
      </dl>
    </ProductPageSection>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Code explorer

export type ProductCodeSample = {
  language: string;
  label: string;
  code: string;
  filename: string;
  /** The SDK's install command; null for plain REST (shows a note instead). */
  install?: string | null;
  /** Pre-highlighted code; falls back to the site's light highlighting. */
  content?: React.ReactNode;
};

// Every explorer on the page follows the same language, and the choice is remembered where storage allows.
const LANGUAGE_KEY = "ds:code-language";
const LANGUAGE_EVENT = "ds:code-language-change";
let sessionLanguage: string | null = null;

function readLanguage() {
  try {
    return sessionLanguage ?? window.localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return sessionLanguage;
  }
}

function storeLanguage(language: string) {
  sessionLanguage = language;
  try {
    window.localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Storage can be blocked; the session value still keeps this page's explorers in sync.
  }
  window.dispatchEvent(new Event(LANGUAGE_EVENT));
}

function subscribeLanguage(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LANGUAGE_KEY) return;
    sessionLanguage = event.newValue;
    onChange();
  };
  window.addEventListener(LANGUAGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(LANGUAGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function InstallCommand({ sample }: { sample: ProductCodeSample }) {
  const { hasCopied, copy } = useCopy();
  if (!sample.install) {
    return <p className="flex min-h-11.5 w-fit max-w-full items-center rounded-control border border-rule bg-subtle px-4 text-body-sm text-fg-muted">No install needed. Call the REST API directly.</p>;
  }
  return (
    <div className="flex w-fit max-w-full items-center justify-between gap-3 rounded-control border border-rule bg-subtle py-1.5 pr-1.5 pl-4">
      <code className="min-w-0 overflow-x-auto font-mono text-body leading-5.5 whitespace-nowrap text-fg [scrollbar-width:none]">
        <span aria-hidden="true" className="text-fg-faint">
          ${" "}
        </span>
        {sample.install}
      </code>
      <button
        type="button"
        onClick={() => copy(sample.install ?? "")}
        aria-label={hasCopied ? `${sample.label} install command copied` : `Copy ${sample.label} install command`}
        className="flex size-8 shrink-0 items-center justify-center rounded-sm text-fg-faint outline-none transition-[background-color,color] duration-150 ease-out hover:bg-surface hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring motion-reduce:transition-none"
      >
        {hasCopied ? <Check aria-hidden="true" className="size-4 text-success" /> : <Copy aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}

function CodeLines({ sample }: { sample: ProductCodeSample }) {
  const numbers = sample.code
    .split("\n")
    .map((_, index) => index + 1)
    .join("\n");
  return (
    <div className="flex w-max min-w-full gap-6 pt-6 pr-7 pb-7 pl-5 font-mono text-caption leading-code [tab-size:4] sm:text-body">
      <pre aria-hidden="true" className="shrink-0 text-right text-white/20 select-none">
        {numbers}
      </pre>
      <div className="text-white/85 [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:text-[length:inherit] [&_pre]:leading-[inherit]">{sample.content ?? <CodeBlock code={sample.code} />}</div>
    </div>
  );
}

/**
 * The code section: the split heading, a line of text, optional steps, the install command and arrow links on the left;
 * a dark window on the right with a language tab per sample, the filename, a copy button and numbered lines.
 */
function ProductCodeExplorer({
  title,
  description,
  steps,
  samples,
  showInstall = true,
  links = [],
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title: readonly [React.ReactNode, React.ReactNode];
  description?: React.ReactNode;
  steps?: { title: React.ReactNode; description: React.ReactNode }[];
  samples: ProductCodeSample[];
  showInstall?: boolean;
  /** Arrow links under the install command; the first is usually the API reference. */
  links?: { label: React.ReactNode; href: string; external?: boolean }[];
}) {
  const baseId = React.useId();
  const stored = React.useSyncExternalStore(subscribeLanguage, readLanguage, () => null);
  const active = samples.find((sample) => sample.language === stored) ?? samples[0];
  const { hasCopied, copy } = useCopy();
  const hasTabs = samples.length > 1;

  const selectByOffset = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const offset = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const next = samples[(samples.indexOf(active) + offset + samples.length) % samples.length];
    storeLanguage(next.language);
    document.getElementById(`${baseId}-tab-${next.language}`)?.focus();
  };

  return (
    <ProductPageSection aria-labelledby={`${baseId}-title`} className={cn("pt-24 lg:pt-40", className)} containerClassName="grid items-center gap-10 lg:grid-cols-[25rem_minmax(0,1fr)] lg:gap-18" {...props}>
      <div className="flex min-w-0 flex-col items-start gap-7">
        <ProductSplitHeading id={`${baseId}-title`} title={title} />
        {description && <p className="text-body-lg leading-relaxed text-pretty text-fg-muted">{description}</p>}
        {steps && (
          <ul className="w-full border-t border-rule">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3.5 border-b border-rule py-3.5">
                <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-pill bg-brand" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-body font-medium text-fg">{step.title}</span>
                  <span className="text-body-sm text-fg-muted">{step.description}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {showInstall && <InstallCommand sample={active} />}
        {links.length > 0 && (
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <ArrowTextLink key={link.href} href={link.href} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {link.label}
              </ArrowTextLink>
            ))}
          </div>
        )}
      </div>
      <div className="min-w-0 overflow-hidden rounded-shell bg-code shadow-floating">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-3.5 sm:px-5">
          {hasTabs ? (
            <div role="tablist" aria-label="Code language" className="-my-0.5 flex min-w-0 items-center gap-1 overflow-x-auto py-0.5 [scrollbar-width:none]">
              {samples.map((sample) => {
                const selected = sample === active;
                return (
                  <button
                    key={sample.language}
                    id={`${baseId}-tab-${sample.language}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel-${sample.language}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => storeLanguage(sample.language)}
                    onKeyDown={selectByOffset}
                    className={cn(
                      "shrink-0 rounded-sm px-3 py-1 text-caption leading-5 outline-none transition-[background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset motion-reduce:transition-none sm:text-body-sm",
                      selected ? "bg-white/10 font-medium text-white" : "text-white/50 hover:text-white/80",
                    )}
                  >
                    {sample.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-sm bg-white/10 px-3 py-1 text-caption leading-5 font-medium text-white sm:text-body-sm">{active.label}</p>
          )}
          <div className="flex shrink-0 items-center gap-3">
            <p className="font-mono text-caption leading-5 text-white/50 max-sm:hidden sm:text-body-sm">{active.filename}</p>
            <button
              type="button"
              onClick={() => copy(active.code)}
              aria-label={hasCopied ? `${active.label} code copied` : `Copy ${active.label} code`}
              className="flex size-7 items-center justify-center rounded-sm bg-white/5 text-white/70 outline-none transition-[background-color,color] duration-150 ease-out hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
            >
              {hasCopied ? <Check aria-hidden="true" className="size-3.5 text-chart-ok" /> : <Copy aria-hidden="true" className="size-3.5" />}
            </button>
          </div>
        </div>
        <div className={cn(hasTabs && "h-90 sm:h-109")}>
          {samples.map((sample) => (
            <div
              key={sample.language}
              id={`${baseId}-panel-${sample.language}`}
              role={hasTabs ? "tabpanel" : "region"}
              aria-labelledby={hasTabs ? `${baseId}-tab-${sample.language}` : undefined}
              aria-label={hasTabs ? undefined : `${sample.filename} code example`}
              tabIndex={0}
              hidden={sample !== active}
              className="h-full overflow-auto outline-none [scrollbar-width:thin] focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset"
            >
              <CodeLines sample={sample} />
            </div>
          ))}
        </div>
      </div>
    </ProductPageSection>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Steps, comparison, reliability

export type ProductStep = { title: React.ReactNode; description: React.ReactNode; snippet?: React.ReactNode };

/** The steps on a gray panel: a blue dot each, joined by a hairline on desktop, with an optional code chip at the foot. */
function ProductStepsTimeline({
  title = ["From your first request", "to a working feature."],
  steps,
  className,
}: {
  title?: readonly [React.ReactNode, React.ReactNode];
  steps: ProductStep[];
  className?: string;
}) {
  const titleId = React.useId();
  return (
    <ProductPageSection aria-labelledby={titleId} className={cn("pt-24 lg:pt-42", className)} containerClassName="flex flex-col gap-10 lg:gap-12">
      <ProductSplitHeading id={titleId} title={title} />
      <ol className="flex flex-col gap-10 rounded-shell bg-subtle p-6 sm:p-10 lg:flex-row lg:p-12">
        {steps.map((step, index) => (
          <li key={index} className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-pill bg-brand" />
              {index < steps.length - 1 && <span aria-hidden="true" className="hidden h-px flex-1 bg-node lg:block" />}
            </div>
            <h3 className="pt-2 text-h4 leading-snug tracking-tight text-fg">{step.title}</h3>
            <p className="text-body-lg leading-relaxed text-pretty text-fg-muted">{step.description}</p>
            {step.snippet && <code className="mt-auto self-start rounded-control border border-rule bg-surface px-3 py-2 font-mono text-caption text-fg">{step.snippet}</code>}
          </li>
        ))}
      </ol>
    </ProductPageSection>
  );
}

export type ProductComparisonColumn = { name: React.ReactNode; caption?: React.ReactNode; href?: string; highlighted?: boolean };
export type ProductComparisonRow = { label: React.ReactNode; values: React.ReactNode[] };

/**
 * A comparison against other ways to do the job: a white table in a hairline card, the highlighted column tinted with
 * a blue top rule, each column's name over a mono caption, and a sourced note under it.
 */
function ProductComparison({
  title,
  description,
  columns,
  rows,
  note,
  className,
}: {
  title: readonly [React.ReactNode, React.ReactNode];
  description?: React.ReactNode;
  columns: ProductComparisonColumn[];
  rows: ProductComparisonRow[];
  /** Under the table: the claim and a link to its source. */
  note?: React.ReactNode;
  className?: string;
}) {
  const titleId = React.useId();
  const tint = "bg-tint/40";
  return (
    <ProductPageSection aria-labelledby={titleId} className={cn("pt-24 lg:pt-42", className)} containerClassName="flex flex-col gap-10 lg:gap-12">
      <ProductSectionHeader id={titleId} title={title} description={description} />
      <div className="flex flex-col gap-5">
        <div tabIndex={0} role="region" aria-labelledby={titleId} className="overflow-x-auto rounded-shell border border-rule bg-surface outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2">
          <table className="w-full min-w-160 table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-40 lg:w-55" />
              {columns.map((_, index) => (
                <col key={index} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-rule">
                <th scope="col" className="px-5 py-6 lg:px-7">
                  <span className="sr-only">Compare</span>
                </th>
                {columns.map((column, index) => {
                  const name = <span className={cn("text-h5 leading-snug tracking-normal", column.highlighted ? "text-fg-brand" : "text-fg")}>{column.name}</span>;
                  return (
                    <th key={index} scope="col" className={cn("px-5 pb-6 align-top font-normal lg:px-7", column.highlighted ? cn(tint, "border-t-2 border-brand pt-5.5") : "pt-6")}>
                      <span className="flex flex-col gap-1.5">
                        {column.href ? (
                          <a href={column.href} className="w-fit rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus-ring">
                            {name}
                          </a>
                        ) : (
                          name
                        )}
                        {column.caption && <span className="font-mono text-caption text-fg-faint">{column.caption}</span>}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-rule last:border-b-0">
                  <th scope="row" className="p-5 align-top text-body font-normal leading-relaxed text-fg-muted lg:px-7">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={index} className={cn("p-5 align-top text-body leading-relaxed text-fg lg:px-7", columns[index]?.highlighted && tint)}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {note && <p className="text-body leading-relaxed text-fg-faint [&_a]:rounded-sm [&_a]:text-fg-muted [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-fg-brand">{note}</p>}
      </div>
    </ProductPageSection>
  );
}

/**
 * The reliability section: the heading row, then the blue stage with a picture (a request log window) beside a large
 * white figure over a hairline and its label, then three pillars under a rule.
 */
function ProductReliability({
  title,
  description,
  visual,
  figure,
  figureLabel,
  figureNote,
  pillars,
  backdrop,
  className,
}: {
  title: readonly [React.ReactNode, React.ReactNode];
  description?: React.ReactNode;
  visual?: React.ReactNode;
  figure: React.ReactNode;
  figureLabel?: React.ReactNode;
  figureNote?: React.ReactNode;
  pillars?: { title: React.ReactNode; description: React.ReactNode }[];
  backdrop?: React.ReactNode;
  className?: string;
}) {
  const titleId = React.useId();
  return (
    <ProductPageSection aria-labelledby={titleId} className={cn("pt-24 lg:pt-42", className)} containerClassName="flex flex-col gap-10 lg:gap-12">
      <ProductSectionHeader id={titleId} title={title} description={description} />
      <ProductStage backdrop={backdrop} className="flex flex-col gap-8 p-3 pb-7 sm:gap-10 sm:p-8 xl:flex-row xl:items-center xl:justify-between xl:gap-16 xl:py-16 xl:pr-18 xl:pl-16">
        {visual && <div className="min-w-0 xl:w-[56%] xl:max-w-150 xl:shrink-0">{visual}</div>}
        <div className="flex min-w-0 flex-1 flex-col gap-4 px-2 text-white sm:px-0">
          <p className="text-h1 leading-tight font-normal tracking-tight sm:text-hero">{figure}</p>
          {(figureLabel || figureNote) && (
            <div className="flex flex-col gap-1.5 border-t border-white/30 pt-4">
              {figureLabel && <p className="text-body-lg">{figureLabel}</p>}
              {figureNote && <p className="font-mono text-caption text-white/85 sm:text-body-sm">{figureNote}</p>}
            </div>
          )}
        </div>
      </ProductStage>
      {pillars && pillars.length > 0 && (
        <div className="grid gap-8 border-t border-rule pt-8 md:grid-cols-3 md:gap-12">
          {pillars.map((pillar, index) => (
            <div key={index} className="flex min-w-0 flex-col gap-2.5">
              <h3 className="text-h5 leading-snug tracking-tight text-fg">{pillar.title}</h3>
              <p className="text-body leading-relaxed text-pretty text-fg-muted">{pillar.description}</p>
            </div>
          ))}
        </div>
      )}
    </ProductPageSection>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// FAQ, related, call to action

/**
 * The FAQ: the split heading and a docs line on the left, hairline rows on the right; the first is open, and opening
 * one closes the others (native details sharing a name). The toggle turns from a gray plus to a blue minus.
 */
function ProductPageFaq({
  id,
  faqs,
  title = ["A few things", "to know."],
  description,
  className,
}: {
  id: string;
  faqs: { question: React.ReactNode; answer: React.ReactNode }[];
  title?: readonly [React.ReactNode, React.ReactNode];
  description?: React.ReactNode;
  className?: string;
}) {
  const titleId = React.useId();
  return (
    <ProductPageSection aria-labelledby={titleId} className={cn("pt-24 lg:pt-42", className)} containerClassName="grid gap-10 lg:grid-cols-[25rem_minmax(0,1fr)] lg:gap-18">
      <div className="flex flex-col items-start gap-5">
        <ProductSplitHeading id={titleId} title={title} />
        {description && <p className="text-body-lg leading-relaxed text-fg-muted [&_a]:rounded-sm [&_a]:text-fg-brand [&_a:hover]:underline">{description}</p>}
      </div>
      <div className="min-w-0 border-t border-rule">
        {faqs.map((faq, index) => (
          <details key={index} name={`${id}-questions`} open={index === 0} className="group border-b border-rule">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-sm py-6.5 text-h5 font-medium tracking-normal text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center">
                <Plus className="size-3.5 text-fg-faint group-open:hidden" />
                <Minus className="size-3.5 text-fg-brand group-not-open:hidden" />
              </span>
            </summary>
            <div className="-mt-3.5 max-w-150 pb-7 text-body-lg leading-relaxed text-pretty text-fg-muted">{faq.answer}</div>
          </details>
        ))}
      </div>
    </ProductPageSection>
  );
}

/** Two related products as gray cards that tint blue on hover, each with a round white arrow button. */
function ProductRelatedCards({ products, className }: { products: { name: React.ReactNode; href: string; description: React.ReactNode }[]; className?: string }) {
  return (
    <ProductPageSection className={cn("pt-16 lg:pt-28", className)}>
      <nav aria-label="Related products" className="grid gap-5 md:grid-cols-2">
        {products.map((product) => (
          <a
            key={product.href}
            href={product.href}
            className="group flex flex-col gap-3.5 rounded-shell bg-subtle px-6 pt-7 pb-8 outline-none transition-[background-color] duration-150 ease-out hover:bg-tint focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 motion-reduce:transition-none sm:px-8 sm:pt-8 sm:pb-8.5"
          >
            <span className="flex items-center justify-between gap-4 text-h5 leading-snug tracking-tight text-fg sm:text-h4">
              {product.name}
              <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-surface">
                <ArrowRight aria-hidden="true" className="size-4 text-fg-brand transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </span>
            </span>
            <span className="text-body-lg leading-relaxed text-fg-muted">{product.description}</span>
          </a>
        ))}
      </nav>
    </ProductPageSection>
  );
}

/** The closing panel: the blue stage with a large white centered heading, a line of text and the light pills. */
function ProductCtaPanel({
  title = "Start with your next request.",
  description,
  actions,
  backdrop,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Light pills (ProductPillLink tone="light"). */
  actions?: React.ReactNode;
  backdrop?: React.ReactNode;
  className?: string;
}) {
  const titleId = React.useId();
  return (
    <ProductPageSection aria-labelledby={titleId} className={cn("py-24 lg:py-42", className)}>
      <ProductStage backdrop={backdrop} className="flex flex-col items-center gap-8 px-6 py-16 text-center sm:px-16 sm:pt-24 sm:pb-25">
        <div className="flex flex-col items-center gap-4">
          <h2 id={titleId} className="text-h2 leading-tight font-normal tracking-tight text-balance text-white sm:text-h1 lg:text-hero">
            {title}
          </h2>
          {description && <p className="max-w-160 text-body-lg leading-relaxed text-pretty text-white/85 sm:text-h5">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap justify-center gap-3">{actions}</div>}
      </ProductStage>
    </ProductPageSection>
  );
}

export {
  ProductPageSection,
  ProductSplitHeading,
  ProductSectionHeader,
  ProductPillLink,
  ArrowTextLink,
  ProductStage,
  ProductStageHero,
  ProductCustomerRow,
  ProductStats,
  ProductCapabilityList,
  ProductCodeExplorer,
  ProductStepsTimeline,
  ProductComparison,
  ProductReliability,
  ProductPageFaq,
  ProductRelatedCards,
  ProductCtaPanel,
};
