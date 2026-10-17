import * as React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The use case pages' proof sections: the customers as outlined chips, a large quote card beside a stack of metric
// cards, the example cards (a title, a sentence and the customer behind it as an arrow link) and the story cards (the
// customer, the story's title and its headline number). Every card is white in the soft blue ring.

const RING = "-m-2 rounded-card bg-ring-tint p-2";
const CARD = "flex h-full min-w-0 flex-col gap-4 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8";
const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";
const ARROW_NUDGE = "size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none";

export type UseCaseCustomer = {
  name: string;
  logo: string;
  /** A wide wordmark, shown alone; otherwise a round mark beside the name. */
  wordmark?: boolean;
  /** Wordmarks drawn in white, turned black for the white chip. */
  whiteArtwork?: boolean;
  /** A fill behind a round mark that needs one (a brand color from the customer's own data). */
  background?: string;
};

/** The customers as outlined pill chips: a round mark and the name, or a wordmark alone. */
function UseCaseCustomers({ items, className }: { items: readonly UseCaseCustomer[]; className?: string }) {
  return (
    <ul data-slot="use-case-customers" className={cn("mb-6 flex flex-wrap gap-3", className)}>
      {items.map((customer) => (
        <li key={customer.name} className="flex items-center gap-2.5 rounded-pill py-1.5 pr-4 pl-1.5 ring-1 ring-black/10 ring-inset">
          {customer.wordmark ? (
            <img src={customer.logo} alt={customer.name} width={88} height={22} className={cn("h-5 w-auto max-w-24 object-contain", customer.whiteArtwork && "brightness-0")} />
          ) : (
            <>
              <img
                src={customer.logo}
                alt=""
                width={28}
                height={28}
                className={cn("size-7 shrink-0 rounded-pill object-cover ring-1 ring-black/6", customer.background && "p-1")}
                style={customer.background ? { backgroundColor: customer.background } : undefined}
              />
              <span className="text-body-sm text-fg">{customer.name}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export type UseCaseProofQuote = { quote: React.ReactNode; name: string; role: string; story?: { label: string; href: string } };
export type UseCaseMetric = { value: string; label: React.ReactNode };

/** The large quote card beside the metric cards (the metrics stack on the right from lg, two across from sm). */
function UseCaseProof({ quote, metrics, className }: { quote: UseCaseProofQuote; metrics: readonly UseCaseMetric[]; className?: string }) {
  return (
    <div data-slot="use-case-proof" className={cn("grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]", className)}>
      <div className={RING}>
        <figure className={cn(CARD, "justify-between gap-8")}>
          <blockquote className="text-h5 leading-snug tracking-tight text-pretty text-fg md:text-h4">&ldquo;{quote.quote}&rdquo;</blockquote>
          <figcaption className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <span className="flex flex-col gap-0.5">
              <span className="text-body text-fg">{quote.name}</span>
              <span className="text-body-sm text-fg-subtle">{quote.role}</span>
            </span>
            {quote.story && (
              <a href={quote.story.href} className={cn(buttonVariants({ variant: "pill-outline" }), "gap-2 py-2.5")}>
                {quote.story.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            )}
          </figcaption>
        </figure>
      </div>
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
        {metrics.map((metric) => (
          <div key={metric.value} className={RING}>
            <div className={cn(CARD, "flex-col-reverse justify-end gap-2")}>
              <dt className="text-body text-fg-secondary">{metric.label}</dt>
              <dd className="text-h2 leading-none tracking-tight text-fg-brand">{metric.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

export type UseCaseExample = { title: string; description: React.ReactNode; href: string; credit: React.ReactNode };

/** What customers built: a title, a sentence and an arrow link to the customer behind it. */
function UseCaseExampleCards({ items, className }: { items: readonly UseCaseExample[]; className?: string }) {
  return (
    <ul data-slot="use-case-example-cards" className={cn("grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <li key={item.title} className={RING}>
          <div className={CARD}>
            <h3 className="text-h4 font-normal text-fg">{item.title}</h3>
            <p className="text-body text-fg-secondary">{item.description}</p>
            <a href={item.href} className={cn("group mt-auto inline-flex w-fit items-center gap-2 rounded-sm pt-2 text-body text-fg-brand", FOCUS)}>
              {item.credit}
              <ArrowRight aria-hidden="true" className={ARROW_NUDGE} />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

export type UseCaseStory = { customer: string; title: React.ReactNode; metric: string; metricLabel: React.ReactNode; href: string };

/** Story cards, the whole card the link: the customer and the story's title on top, its headline number at the foot. */
function UseCaseStoryCards({ items, className }: { items: readonly UseCaseStory[]; className?: string }) {
  return (
    <ul data-slot="use-case-story-cards" className={cn("grid grid-cols-1 gap-6 md:grid-cols-3", className)}>
      {items.map((story) => (
        <li key={story.href} className={RING}>
          <a href={story.href} className={cn(CARD, "group relative justify-between gap-10 transition-[background-color] duration-200 ease-out hover:bg-tint/40 motion-reduce:transition-none", FOCUS)}>
            <span className="flex flex-col gap-3 pr-8">
              <span className="text-body-sm text-fg-subtle">{story.customer}</span>
              <span className="text-h5 text-pretty text-fg">{story.title}</span>
            </span>
            <ArrowUpRight aria-hidden="true" className="absolute top-6 right-6 size-5 text-black/35 transition-[color] duration-200 ease-out group-hover:text-fg-brand motion-reduce:transition-none md:top-8 md:right-8" />
            <span className="flex flex-col gap-1">
              <span className="text-h3 leading-none tracking-tight text-fg-brand">{story.metric}</span>
              <span className="text-body-sm text-fg-secondary">{story.metricLabel}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export { UseCaseCustomers, UseCaseProof, UseCaseExampleCards, UseCaseStoryCards };
