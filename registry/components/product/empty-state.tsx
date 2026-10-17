import * as React from "react";

import { cn } from "@/lib/utils";

// Never a blank page: a glyph tile (64px, or the 112px ringed story for a product's first visit), the title at h4, one
// balanced line of muted text at most 480px wide, then the next actions (the brand button first) and anything quieter
// under them, such as a usage line. Centered in the page column, which it fills when the page has nothing else.
function EmptyState({
  glyph,
  title,
  description,
  actions,
  footer,
  fill = false,
  as: Heading = "h2",
  className,
}: {
  glyph?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  /** Takes the page's height and centers itself in it, as on a page with nothing else to show. */
  fill?: boolean;
  /** h1 when the empty state is the whole page (it stands in for the page header). */
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div data-slot="empty-state" className={cn("flex flex-col items-center px-8 text-center", fill ? "my-auto flex-1 justify-center py-16" : "pt-8 pb-10", className)}>
      {glyph}
      <Heading className={cn("text-h4 leading-snug font-[450] tracking-normal text-fg", glyph && "mt-6")}>{title}</Heading>
      {description && <p className="mt-1 max-w-120 text-body-sm text-balance text-fg-muted">{description}</p>}
      {actions && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
}

/** Inside a table: the one row saying nothing matches, or nothing has happened yet, in quiet text. */
function EmptyStateRow({ colSpan, className, children }: { colSpan: number; className?: string; children: React.ReactNode }) {
  return (
    <tr data-slot="empty-state-row">
      <td colSpan={colSpan} className={cn("px-4 py-12 text-center text-body-sm text-fg-subtle", className)}>
        {children}
      </td>
    </tr>
  );
}

export { EmptyState, EmptyStateRow };
