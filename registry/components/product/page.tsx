import * as React from "react";

import { cn } from "@/lib/utils";

// A product page: one centered column about 880px wide, the header centered at the top (title h4 at weight 450, one
// line of muted text, then the page's main action), sections below.
function PageColumn({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="page-column" className={cn("mx-auto flex w-full max-w-220 flex-col gap-6 px-8 pt-8 pb-10 max-md:px-4", className)} {...props} />;
}

function PageHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <header data-slot="page-header" className={cn("flex flex-col items-center gap-1 text-center", className)}>
      <h1 className="text-h4 leading-snug font-[450] tracking-normal text-fg">{title}</h1>
      {description && <p className="max-w-120 text-body-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </header>
  );
}

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

export { PageColumn, PageHeader, PageSection };
