import * as React from "react";

import { SectionHeaderRule, SiteSection } from "@/components/site/section";
import { cn } from "@/lib/utils";

// A customer story's page: the first section under the header, its column edge lines starting below the navbar. A back
// link to all the stories, the title at section-heading size with its closing words in blue, and the date, left aligned
// in a 48rem column over an optional backdrop (the site runs its fine dot field here, from edge line to edge line and
// down to the rule). Under the rule, the story itself in the same column (the blog's prose).

function CustomerStoryPage({
  title,
  accent,
  date,
  dateTime,
  backHref = "/customers",
  backLabel = "All customer stories",
  backdrop,
  className,
  children,
}: {
  title: React.ReactNode;
  /** The title's closing words, in brand blue. */
  accent?: React.ReactNode;
  date?: string;
  dateTime?: string;
  backHref?: string;
  backLabel?: string;
  backdrop?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const titleId = React.useId();
  return (
    <SiteSection lines header="below" aria-labelledby={titleId} data-slot="customer-story-page" className={className}>
      {/* The section's padding is taken back, so the backdrop runs from edge line to edge line and down to the rule. */}
      <div className="relative isolate -mx-6 -mt-10 -mb-10 px-6 pt-10 pb-10 md:-mx-10 md:-mt-12 md:-mb-12 md:px-10 md:pt-12 md:pb-12 lg:-mx-12 lg:px-12">
        {backdrop && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            {backdrop}
          </div>
        )}
        <header className="relative mx-auto flex max-w-3xl flex-col items-start gap-6">
          <a href={backHref} className="rounded-sm text-body-sm text-fg-nav outline-none transition-[color] duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none">
            &larr; {backLabel}
          </a>
          <h1 id={titleId} className="w-full text-h3 font-normal text-balance text-fg md:text-h2">
            {title}
            {accent && (
              <>
                {" "}
                <span className="text-fg-brand">{accent}</span>
              </>
            )}
          </h1>
          {date && (
            <time dateTime={dateTime} className="text-body-sm text-fg-nav">
              {date}
            </time>
          )}
        </header>
      </div>
      <SectionHeaderRule />
      <div className={cn("mx-auto max-w-3xl")}>{children}</div>
    </SiteSection>
  );
}

export { CustomerStoryPage };
