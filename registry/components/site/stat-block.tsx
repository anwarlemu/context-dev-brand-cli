import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// The use-case pages' proof figures: a big brand-blue figure in the heading face with a plain caption under it, each
// in the site's ringed card. The caption is the term and the figure its value, so the list reads right to a screen
// reader while the figure still sits on top.

/** A list of figures. One column on phones, two from sm, or pass your own grid. */
function StatBlocks({ className, ...props }: React.ComponentProps<"dl">) {
  return <dl data-slot="stat-blocks" className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2", className)} {...props} />;
}

/** One figure and its caption, e.g. "< 1 day" over "for SiteGPT to move its website crawling off Firecrawl". */
function StatBlock({ value, label, className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { value: React.ReactNode; label: React.ReactNode }) {
  return (
    <Card variant="ring" data-slot="stat-block" className={cn("h-full min-w-0 flex-col-reverse justify-end gap-2", className)} {...props}>
      <dt className="text-body leading-relaxed text-fg-secondary">{label}</dt>
      <dd className="text-h2 leading-none tracking-tight text-fg-brand md:text-h1">{value}</dd>
    </Card>
  );
}

export { StatBlock, StatBlocks };
