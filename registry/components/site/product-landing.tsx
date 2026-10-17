import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductMedia } from "@/components/site/product-grid";
import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { cn } from "@/lib/utils";

// A product's landing page on the home page's design (the Scrape, Map, Batches, Monitors, Answers, Brand and Style
// guide pages): the site's Hero, the logo strip, then these sections in the ruled column. Each opens with the site's
// section heading over a header rule, and every card is white in the soft blue ring with a demo window at its foot. The
// closing call to action is the site's ClosingCta.

export type ProductStoryCardItem = { title: string; description: React.ReactNode; story?: React.ReactNode };

/** A capability or workflow card: the title at h4, a line of muted text, and the demo window filling the rest. */
function ProductStoryCard({ title, description, story, className }: ProductStoryCardItem & { className?: string }) {
  return (
    <li data-slot="product-story-card" className={cn("-m-2 flex rounded-card bg-ring-tint p-2", className)}>
      <div className="flex h-full min-w-0 flex-1 flex-col gap-6 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8">
        <div className="flex flex-col gap-3">
          <h3 className="text-h4 font-normal text-fg">{title}</h3>
          <p className="text-body leading-relaxed text-fg-secondary">{description}</p>
        </div>
        <ProductMedia className="[&>div]:px-4 [&>div]:py-8 sm:[&>div]:px-9">{story}</ProductMedia>
      </div>
    </li>
  );
}

/**
 * A section of story cards under a heading: three across for capabilities, two for workflows. `title` and `accent`
 * read as one sentence, the accent in brand blue.
 */
function ProductStorySection({
  title,
  accent,
  description,
  items,
  columns = 3,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode;
  accent?: React.ReactNode;
  description?: React.ReactNode;
  items: ProductStoryCardItem[];
  columns?: 2 | 3;
}) {
  return (
    <SiteSection lines className={className} {...props}>
      <SectionHeading title={title} accent={accent} description={description} />
      <SectionHeaderRule />
      <ul className={cn("grid grid-cols-1 gap-6", columns === 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
        {items.map((item) => (
          <ProductStoryCard key={item.title} {...item} />
        ))}
      </ul>
    </SiteSection>
  );
}

/** The install command as a hairline pill: a faint prompt and the command in mono. */
function InstallChip({ command, className }: { command: string; className?: string }) {
  return (
    <div data-slot="install-chip" className={cn("flex items-center gap-2 rounded-pill px-4 py-2 font-mono text-body-sm text-fg-nav ring-1 ring-line-strong ring-inset", className)}>
      <span aria-hidden="true" className="text-fg-faint">
        $
      </span>
      <code>{command}</code>
    </div>
  );
}

/**
 * The code section: the heading, a line of muted text, the install command and the docs pill on the left; the code
 * sample (a CodeWindow) on the right.
 */
function ProductIntegration({
  title,
  accent,
  description,
  install,
  docsHref,
  docsLabel = "Read the API reference",
  code,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode;
  accent?: React.ReactNode;
  description?: React.ReactNode;
  /** The install command, shown as a pill ("npm install context.dev"). */
  install?: string;
  docsHref?: string;
  docsLabel?: React.ReactNode;
  /** The code sample: a CodeWindow or CodeTabs. */
  code: React.ReactNode;
}) {
  return (
    <SiteSection lines className={cn("pt-16 md:pt-20", className)} {...props}>
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
        <SectionHeading title={title} accent={accent} description={description} className="min-w-0 gap-6">
          {install && <InstallChip command={install} />}
          {docsHref && (
            <Button asChild variant="pill-outline">
              <a href={docsHref} target="_blank" rel="noopener noreferrer">
                {docsLabel}
              </a>
            </Button>
          )}
        </SectionHeading>
        <div className="min-w-0">{code}</div>
      </div>
    </SiteSection>
  );
}

export type ProductFaqItem = { question: string; answer: React.ReactNode };

/**
 * The questions as one white card in the soft blue ring, hairlines between them, the first one open. Native details
 * share a `name`, so opening one closes the others with no script.
 */
function ProductFaqList({ id, faqs, className }: { id: string; faqs: ProductFaqItem[]; className?: string }) {
  return (
    <div data-slot="product-faq-list" className={cn("-m-2 min-w-0 rounded-card bg-ring-tint p-2", className)}>
      <div className="rounded-card bg-surface px-6 ring-1 ring-hairline md:px-8">
        {faqs.map((faq, index) => (
          <details key={faq.question} name={`${id}-questions`} open={index === 0} className="group border-t border-hairline py-5 first:border-0 md:py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-sm text-body-lg text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              {faq.question}
              <Plus aria-hidden="true" className="size-4 shrink-0 text-fg-brand group-open:hidden" />
              <Minus aria-hidden="true" className="size-4 shrink-0 text-fg-brand group-not-open:hidden" />
            </summary>
            <div className="mt-3 text-body leading-relaxed text-fg-secondary">{faq.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

/** The FAQ section: the heading and a docs line on the left, the ringed question card on the right. */
function ProductFaq({
  id,
  faqs,
  title = "A few things",
  accent = "to know.",
  description,
  docsHref,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title" | "id"> & {
  id: string;
  faqs: ProductFaqItem[];
  title?: React.ReactNode;
  accent?: React.ReactNode;
  /** Under the heading. Defaults to a line pointing at `docsHref`. */
  description?: React.ReactNode;
  docsHref?: string;
}) {
  const line =
    description ??
    (docsHref ? (
      <>
        More details in the{" "}
        <a href={docsHref} target="_blank" rel="noopener noreferrer" className="rounded-sm text-fg-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus-ring">
          API documentation
        </a>
        .
      </>
    ) : undefined);
  return (
    <SiteSection lines className={cn("pt-16 md:pt-20", className)} {...props}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
        <SectionHeading title={title} accent={accent} description={line} className="gap-6" />
        <ProductFaqList id={id} faqs={faqs} />
      </div>
    </SiteSection>
  );
}

export { ProductStorySection, ProductStoryCard, ProductIntegration, InstallChip, ProductFaq, ProductFaqList };
