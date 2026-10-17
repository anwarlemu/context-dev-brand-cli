import * as React from "react";

import { cn } from "@/lib/utils";

// The use-case pages' proof figures: a big brand-blue figure in the heading face with a plain caption under it, each
// in a white card inside the soft blue ring. The caption is the term and the figure its value, so the list reads right
// to a screen reader while the figure still sits on top.

/** A list of figures. One column on phones, two from sm; beside a quote, pass `lg:grid-cols-1` to stack them. */
function StatBlocks({ className, ...props }: React.ComponentProps<"dl">) {
  return <dl data-slot="stat-blocks" className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2", className)} {...props} />;
}

/** One figure and its caption, e.g. "< 1 day" over "for SiteGPT to move its website crawling off Firecrawl". */
function StatBlock({ value, label, className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { value: React.ReactNode; label: React.ReactNode }) {
  return (
    // The ring wraps the card, so its outer edge keeps the card's radius; the negative margin keeps it out of the grid's gaps.
    <div data-slot="stat-block" className={cn("-m-2 rounded-card bg-ring-tint p-2", className)} {...props}>
      <div className="flex h-full min-w-0 flex-col-reverse justify-end gap-2 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8">
        <dt className="text-body leading-snug text-fg-secondary">{label}</dt>
        <dd className="text-h2 leading-none tracking-tight text-fg-brand">{value}</dd>
      </div>
    </div>
  );
}

export { StatBlock, StatBlocks };
