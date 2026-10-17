import * as React from "react";

import { cn } from "@/lib/utils";

// Every product page's column: 880px at most, balanced between the sidebar and what floats at the right (the support
// button) rather than the bare edges, so beside the sidebar it sits 80px left of the middle of its space, or as much
// of that as the room allows. Below 768px the sidebar is a drawer and the column simply centers. It is an @container,
// so cards inside lay out by the page's width. The header is centered at the top (h4 title at weight 450, one muted
// line under it, then the page's main action).
function PageColumn({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-column"
      data-page-column
      className={cn("@container mx-auto flex w-full max-w-220 flex-col gap-6 px-8 pt-8 pb-10 max-md:px-4 md:ml-[max(0px,calc((100%-55rem)/2-80px))]", className)}
      {...props}
    />
  );
}

function PageHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <header data-slot="page-header" className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <div>
        <h1 className="text-h4 leading-snug font-[450] tracking-normal text-fg">{title}</h1>
        {description && <p className="mt-1 text-body-sm text-balance text-fg-muted">{description}</p>}
      </div>
      {action}
    </header>
  );
}

/** A titled group of cards on a page: the title in body text, an action (a link or a button) at the right. */
function PageSection({ title, action, className, children }: { title?: React.ReactNode; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section data-slot="page-section" className={cn("flex flex-col gap-3", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title && <h2 className="text-body-sm font-normal text-fg">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Cards rise in one after another, 50ms apart, on the page's first render (the brand's content-in: a short rise and a
 * fade, ease-out); cards that mount later, after the page has entered, should render without it. Reduced motion
 * keeps the fade only.
 */
function PageRise({ index = 0, className, children }: { index?: number; className?: string; children: React.ReactNode }) {
  return (
    <div data-slot="page-rise" className={cn("grid animate-content-in", className)} style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}>
      {children}
    </div>
  );
}

export { PageColumn, PageHeader, PageRise, PageSection };
