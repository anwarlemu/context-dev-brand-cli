import { cn } from "@/lib/utils";

// The docs' page rhythm inside the dashboard shell: a ruled page head, then titled sections, all in the wide column.

/** A docs page's column. */
export function DocsPage({ className, children }: { className?: string; children: React.ReactNode }) {
  return <main className={cn("mx-auto w-full max-w-(--ds-layout-column-wide) px-4 pb-16 sm:px-8 lg:px-12", className)}>{children}</main>;
}

/**
 * The page head: an eyebrow (a component's group), the title as the page's only h1 at the dashboard's page-title size,
 * one muted line, actions at the right, ruled off below.
 */
export function PageHead({ eyebrow, title, description, actions, children }: { eyebrow?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header data-docs-head="" className="border-b border-line-subtle pt-8 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 max-w-3xl">
          {eyebrow && <p className="mb-1.5 text-caption text-fg-subtle">{eyebrow}</p>}
          <h1 className="text-h4 leading-title font-[450] tracking-normal text-fg">{title}</h1>
          {description && <p className="mt-1.5 text-body-sm text-pretty text-fg-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-4 text-body-sm">{actions}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}

/** A titled section of a docs page. */
export function DocsSection({ id, title, description, className, children }: { id?: string; title?: React.ReactNode; description?: React.ReactNode; className?: string; children?: React.ReactNode }) {
  return (
    <section id={id} className={cn("scroll-mt-6 pt-10", className)}>
      {title && <h2 className="text-h5 leading-snug tracking-normal text-fg">{title}</h2>}
      {description && <p className="mt-1.5 max-w-3xl text-body-sm text-pretty text-fg-muted">{description}</p>}
      {children && <div className={cn(title || description ? "mt-5" : undefined)}>{children}</div>}
    </section>
  );
}
